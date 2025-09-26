"use client";
import { useState, useEffect } from "react";
import { DataTable } from "@/components/Dashboard/DataTable";
import { RoleGuard } from "@/middleware/roleGuard";
import { ContentService } from "@/services/dashboardService";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

interface BlogFormData {
  title: string;
  content: string;
  excerpt: string;
  tags: string;
  status: "draft" | "published";
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">("create");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BlogFormData>({
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      tags: "",
      status: "draft",
    },
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await ContentService.getBlogs({ limit: 50 });
      if (response.success) {
        setBlogs(response.data || []);
      } else {
        toast.error(response.message || "Failed to fetch blogs");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    reset();
    setSelectedBlog(null);
    setDialogMode("create");
    setIsDialogOpen(true);
  };

  const handleEdit = (blog: any) => {
    setSelectedBlog(blog);
    setDialogMode("edit");
    setValue("title", blog.title || "");
    setValue("content", blog.content || "");
    setValue("excerpt", blog.excerpt || "");
    setValue("tags", Array.isArray(blog.tags) ? blog.tags.join(", ") : (blog.tags || ""));
    setValue("status", blog.status || "draft");
    setIsDialogOpen(true);
  };

  const handleView = (blog: any) => {
    setSelectedBlog(blog);
    setDialogMode("view");
    setIsDialogOpen(true);
  };

  const handleDelete = async (blog: any) => {
    if (!confirm(`Are you sure you want to delete "${blog.title}"?`)) {
      return;
    }

    try {
      const response = await ContentService.deleteBlog(blog._id);
      if (response.success) {
        toast.success("Blog deleted successfully");
        fetchBlogs();
      } else {
        toast.error(response.message || "Failed to delete blog");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const onSubmit = async (data: BlogFormData) => {
    try {
      const blogData = {
        ...data,
        tags: data.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      };

      let response;
      if (dialogMode === "edit" && selectedBlog) {
        response = await ContentService.updateBlog(selectedBlog._id, blogData);
      } else {
        response = await ContentService.createBlog(blogData);
      }

      if (response.success) {
        toast.success(`Blog ${dialogMode === "edit" ? "updated" : "created"} successfully`);
        setIsDialogOpen(false);
        fetchBlogs();
      } else {
        toast.error(response.message || `Failed to ${dialogMode} blog`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const getStatusBadge = (status: string) => (
    <Badge variant={status === "published" ? "default" : "secondary"}>
      {status === "published" ? "Published" : "Draft"}
    </Badge>
  );

  const columns = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (value: string, row: any) => (
        <div>
          <p className="font-medium">{value}</p>
          {row.excerpt && (
            <p className="text-sm text-gray-500 truncate max-w-md">{row.excerpt}</p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: "tags",
      label: "Tags",
      render: (value: string[] | string) => (
        <div className="flex flex-wrap gap-1">
          {(Array.isArray(value) ? value : []).slice(0, 3).map((tag: string, index: number) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {(Array.isArray(value) ? value : []).length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{(Array.isArray(value) ? value : []).length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "author",
      label: "Author",
      render: (value: any) => value?.name || "Unknown",
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const BlogDetails = ({ blog }: { blog: any }) => (
    <div className="space-y-6" data-testid="blog-details">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{blog.title}</h2>
        {getStatusBadge(blog.status)}
      </div>

      {blog.excerpt && (
        <div>
          <Label className="text-sm font-medium text-gray-500">Excerpt</Label>
          <p className="mt-1 text-sm italic text-gray-700">{blog.excerpt}</p>
        </div>
      )}

      <div>
        <Label className="text-sm font-medium text-gray-500">Content</Label>
        <div className="mt-1 prose max-w-none">
          <div 
            className="text-sm whitespace-pre-wrap" 
            dangerouslySetInnerHTML={{ __html: blog.content || "No content available" }}
          />
        </div>
      </div>

      {blog.tags && Array.isArray(blog.tags) && blog.tags.length > 0 && (
        <div>
          <Label className="text-sm font-medium text-gray-500">Tags</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {blog.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
        <div>
          <Label className="text-sm font-medium text-gray-500">Author</Label>
          <p className="font-medium">{blog.author?.name || "Unknown"}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Created At</Label>
          <p className="font-medium">{new Date(blog.createdAt).toLocaleString()}</p>
        </div>
        {blog.updatedAt && (
          <>
            <div>
              <Label className="text-sm font-medium text-gray-500">Updated At</Label>
              <p className="font-medium">{new Date(blog.updatedAt).toLocaleString()}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <RoleGuard allowedRoles={["admin", "moderator"]}>
      <div className="space-y-6" data-testid="blogs-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
            <p className="text-muted-foreground">
              Create and manage blog posts and articles
            </p>
          </div>
          <Button onClick={handleCreate} data-testid="create-blog-btn">
            <Plus className="h-4 w-4 mr-2" />
            Create Blog Post
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Posts</p>
                  <p className="text-2xl font-bold">{blogs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold">
                    {blogs.filter((blog: any) => blog.status === "published").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Edit className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-2xl font-bold">
                    {blogs.filter((blog: any) => blog.status === "draft").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold">
                    {blogs.filter((blog: any) => 
                      new Date(blog.createdAt).getMonth() === new Date().getMonth()
                    ).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DataTable
          title="Blog Posts"
          data={blogs}
          columns={columns}
          searchKeys={["title", "content", "tags"]}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          loading={loading}
          actions={[
            {
              label: "View Post",
              onClick: handleView,
              variant: "default",
            },
            {
              label: "Edit Post",
              onClick: handleEdit,
              variant: "default",
            },
            {
              label: "Delete Post",
              onClick: handleDelete,
              variant: "destructive",
            },
          ]}
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === "create" && "Create Blog Post"}
                {dialogMode === "edit" && "Edit Blog Post"}
                {dialogMode === "view" && "Blog Post Details"}
              </DialogTitle>
            </DialogHeader>

            {dialogMode === "view" && selectedBlog ? (
              <BlogDetails blog={selectedBlog} />
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    {...register("title", { required: "Title is required" })}
                    placeholder="Blog post title"
                    data-testid="blog-title-input"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    {...register("excerpt")}
                    placeholder="Brief description of the blog post"
                    rows={3}
                    data-testid="blog-excerpt-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    {...register("content", { required: "Content is required" })}
                    placeholder="Blog post content (HTML allowed)"
                    rows={12}
                    data-testid="blog-content-input"
                  />
                  {errors.content && (
                    <p className="text-sm text-red-600">{errors.content.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      {...register("tags")}
                      placeholder="Tags separated by commas"
                      data-testid="blog-tags-input"
                    />
                    <p className="text-xs text-gray-500">Separate tags with commas</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      {...register("status")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="blog-status-select"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    data-testid="blog-form-cancel"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" data-testid="blog-form-submit">
                    {dialogMode === "edit" ? "Update Post" : "Create Post"}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}