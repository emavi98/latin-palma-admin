import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table";
import { ImagePlus, X } from "lucide-react";
import { Textarea } from "components/ui/textarea";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

// Inicializa el cliente de Supabase (reemplaza con tus propias credenciales)
const supabase = createClient(
  "https://orjpdevjyfchuscuhrrm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yanBkZXZqeWZjaHVzY3VocnJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUyNzEwNjksImV4cCI6MjA0MDg0NzA2OX0.96cCjSz4WihmBz6J2-Rt4HXJbykhMmkUHArscIAU3Gk",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

type InstagramPost = {
  id: string;
  image: string;
  caption: string;
};

type Customer = {
  id: number;
  created_at: string;
  company_name: string;
  company_address: string;
  instagram_posts: InstagramPost[];
};

function Index() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);

  const [editForm, setEditForm] = useState({
    company_name: "",
    company_address: "",
    instagram_posts: [] as InstagramPost[],
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  console.log(customers);

  async function fetchCustomers() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from("customers").select("*");
      setCustomers(data);
      setIsLoading(false);
    } catch (error) {
      setError("Error fetching customers");
      console.error("Error fetching customers:", error);
      setIsLoading(false);
    }
  }

  async function handleCreate() {
    try {
      const { data, error } = await supabase.from("customers").select("*");
      setCustomers(data);
    } catch (error) {
      setError("Error creating customer");
      console.error("Error creating customer:", error);
    }
  }

  async function handleUpdate() {
    if (!selectedCustomer) return;

    try {
      const { error } = await supabase
        .from("customers")
        .update({
          company_name: editForm.company_name,
          company_address: editForm.company_address,
        })
        .eq("id", selectedCustomer.id);

      if (error) throw error;

      setCustomers(
        customers.map((c) =>
          c.id === selectedCustomer.id
            ? {
                ...c,
                company_name: editForm.company_name,
                company_address: editForm.company_address,
              }
            : c
        )
      );

      setIsEditModalOpen(false);
    } catch (error) {
      setError("Error updating customer");
      console.error("Error updating customer:", error);
    }
  }

  async function handleDelete() {
    if (!selectedCustomer) return;

    try {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", selectedCustomer.id);

      if (error) throw error;

      setCustomers(customers.filter((c) => c.id !== selectedCustomer.id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      setError("Error deleting customer");
      console.error("Error deleting customer:", error);
    }
  }

  function handleEditClick(customer: Customer) {
    setSelectedCustomer(customer);
    setEditForm({
      company_name: customer.company_name,
      company_address: customer.company_address,
      instagram_posts: customer.instagram_posts || [],
    });
    setIsEditModalOpen(true);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPost: InstagramPost = {
          id: Date.now().toString(),
          image: reader.result as string,
          caption: "",
        };
        setEditForm((prev) => ({
          ...prev,
          instagram_posts: [...prev.instagram_posts, newPost],
        }));
        setSelectedPost(newPost);
      };
      reader.readAsDataURL(file);
    }
  }

  function handlePostSelect(post: InstagramPost) {
    setSelectedPost(post);
  }

  function handlePostUpdate(updatedPost: InstagramPost) {
    setEditForm((prev) => ({
      ...prev,
      instagram_posts: prev.instagram_posts.map((p) =>
        p.id === updatedPost.id ? updatedPost : p
      ),
    }));
  }

  function handlePostDelete(postId: string) {
    setEditForm((prev) => ({
      ...prev,
      instagram_posts: prev.instagram_posts.filter((p) => p.id !== postId),
    }));
    setSelectedPost(null);
  }

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <Button onClick={handleCreate} className="mb-4">
        Add New Customer
      </Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Company Name</TableHead>
            <TableHead>Company Address</TableHead>
            <TableHead>Instagram Posts</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>{customer.id}</TableCell>
              <TableCell>
                {new Date(customer.created_at).toLocaleString()}
              </TableCell>
              <TableCell>{customer.company_name}</TableCell>
              <TableCell>{customer.company_address}</TableCell>
              <TableCell>{customer.instagram_posts?.length || 0}</TableCell>
              <TableCell>
                <Button
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setIsViewModalOpen(true);
                  }}
                  className="mr-2"
                >
                  View
                </Button>
                <Button
                  onClick={() => handleEditClick(customer)}
                  className="mr-2"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setIsDeleteModalOpen(true);
                  }}
                  variant="destructive"
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div>
              <p>
                <strong>ID:</strong> {selectedCustomer.id}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(selectedCustomer.created_at).toLocaleString()}
              </p>
              <p>
                <strong>Company Name:</strong> {selectedCustomer.company_name}
              </p>
              <p>
                <strong>Company Address:</strong>{" "}
                {selectedCustomer.company_address}
              </p>
              {selectedCustomer.instagram_posts &&
                selectedCustomer.instagram_posts.length > 0 && (
                  <div className="mt-4">
                    <p>
                      <strong>Instagram Posts:</strong>
                    </p>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {selectedCustomer.instagram_posts.map((post) => (
                        <img
                          key={post.id}
                          src={post.image}
                          alt="Instagram post"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company_name" className="text-right">
                Company Name
              </Label>
              <Input
                id="company_name"
                value={editForm.company_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, company_name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company_address" className="text-right">
                Company Address
              </Label>
              <Input
                id="company_address"
                value={editForm.company_address}
                onChange={(e) =>
                  setEditForm({ ...editForm, company_address: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">Instagram Posts</Label>
              <div className="col-span-3">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {editForm.instagram_posts.map((post) => (
                    <div key={post.id} className="relative">
                      <img
                        src={post.image}
                        alt="Instagram post"
                        className="w-full h-24 object-cover rounded-lg cursor-pointer"
                        onClick={() => handlePostSelect(post)}
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => handlePostDelete(post.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Label
                    htmlFor="new_post"
                    className="cursor-pointer flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg"
                  >
                    <div className="text-center">
                      <ImagePlus className="mx-auto h-8 w-8 text-gray-400" />
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Add Post
                      </span>
                    </div>
                  </Label>
                  <Input
                    id="new_post"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                {selectedPost && (
                  <div className="mt-4">
                    <Label htmlFor="post_caption">Caption</Label>
                    <Textarea
                      id="post_caption"
                      value={selectedPost.caption}
                      onChange={(e) =>
                        handlePostUpdate({
                          ...selectedPost,
                          caption: e.target.value,
                        })
                      }
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdate}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this customer?</p>
          <DialogFooter>
            <Button
              onClick={() => setIsDeleteModalOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
