"use client";
import {
  deleteRequestSend,
  getRequestSend,
  postRequestSend,
  putRequestSend,
} from "@/components/ApiCall/methord";
import {
  REVIEW_API,
  SINGLE_REVIEW_API,
  NOTIFICATION_API,
} from "@/components/ApiCall/url";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/AuthContext";
import {
  Star,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  LoaderCircle,
  Edit,
  Trash2,
  User,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  StarIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { toast } from "sonner";

type Review = {
  _id: string;
  user: {
    _id: string;
    name: string;
    phone: string;
    email: string;
  };
  rating: number;
  title: string;
  comment: string;
  status: "pending" | "approved" | "rejected";
  isPublic: boolean;
  moderator?: {
    _id: string;
    name: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
};

const DashboardReviews = () => {
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterRating, setFilterRating] = useState<string>("all");
  const [filterPublic, setFilterPublic] = useState<string>("all");

  // InfiniteScroll states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  // Role-based permissions
  const canViewAll = user?.role === "admin" || user?.role === "moderator";
  const canManage = user?.role === "admin" || user?.role === "moderator";
  const canDelete = user?.role === "admin";
  const canApprove = user?.role === "admin" || user?.role === "moderator";

  // Fetch reviews with pagination and filters
  const fetchReviews = async (pageNum = 1, reset = false) => {
    try {
      const queryParams = new URLSearchParams();

      // Add user filter for non-admin users
      if (user?.role === "user") {
        queryParams.set("user", user.id);
      }

      queryParams.set("page", pageNum.toString());
      queryParams.set("limit", "10");

      if (searchTerm) {
        queryParams.set("search", searchTerm);
      }

      const url = `${REVIEW_API}?${queryParams.toString()}`;
      const response = await getRequestSend<Review[]>(url, {
        Authorization: `Bearer ${user?.token}`,
      });

      if (response.status === 200 && response.data) {
        const newReviews = Array.isArray(response.data) ? response.data : [];

        if (reset || pageNum === 1) {
          setReviews(newReviews);
        } else {
          setReviews((prev) => [...prev, ...newReviews]);
        }

        // Check if there are more pages
        const totalPages = response.meta?.totalPages || 1;
        setHasMore(pageNum < totalPages);

        if (pageNum === 1) {
          toast.success("Reviews loaded successfully");
        }
      } else {
        toast.error(response.message || "Failed to fetch reviews");
        setHasMore(false);
      }
    } catch (error) {
      toast.error("Failed to fetch reviews");
      console.error("Fetch reviews error:", error);
      setHasMore(false);
    } finally {
      setInitialLoading(false);
    }
  };

  // Fetch more reviews for infinite scroll
  const fetchMoreReviews = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage, false);
  };

  // Load initial data
  useEffect(() => {
    if (user?.token) {
      fetchReviews(1, true);
      setPage(1);
    }
  }, [user, searchTerm]);

  // Filter reviews based on search term and filters
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = 
      review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || review.status === filterStatus;
    const matchesRating = filterRating === "all" || review.rating.toString() === filterRating;
    const matchesPublic = filterPublic === "all" || 
      (filterPublic === "true" ? review.isPublic : !review.isPublic);

    return matchesSearch && matchesStatus && matchesRating && matchesPublic;
  });

  // Calculate stats
  const stats = {
    total: filteredReviews.length,
    pending: filteredReviews.filter((r) => r.status === "pending").length,
    approved: filteredReviews.filter((r) => r.status === "approved").length,
    rejected: filteredReviews.filter((r) => r.status === "rejected").length,
    public: filteredReviews.filter((r) => r.isPublic).length,
    private: filteredReviews.filter((r) => !r.isPublic).length,
    averageRating: filteredReviews.length > 0 
      ? (filteredReviews.reduce((sum, r) => sum + r.rating, 0) / filteredReviews.length).toFixed(1)
      : 0,
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  // Handle create review
  const handleCreateReview = async (formData: FormData) => {
    try {
      setLoading(true);

      const reviewData = {
        user: user?.id,
        rating: Number(formData.get("rating")),
        title: formData.get("title") as string,
        comment: formData.get("comment") as string,
        isPublic: formData.get("isPublic") === "true",
        status: "pending",
      };

      const response = await postRequestSend(
        REVIEW_API,
        { Authorization: `Bearer ${user?.token}` },
        reviewData
      );

      if (response.status === 201) {
        toast.success("Review submitted successfully");
        setIsCreateModalOpen(false);
        // Reset and fetch fresh data
        setReviews([]);
        setPage(1);
        setHasMore(true);
        fetchReviews(1, true);
      } else {
        toast.error(response.message || "Failed to submit review");
      }
    } catch (error) {
      toast.error("Failed to submit review");
      console.error("Create review error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete review
  const handleDeleteReview = async (review: Review) => {
    if (!canDelete) {
      toast.error("You do not have permission to delete reviews");
      return;
    }

    if (confirm(`Are you sure you want to delete this review?`)) {
      try {
        const response = await deleteRequestSend(
          SINGLE_REVIEW_API(review._id),
          { Authorization: `Bearer ${user?.token}` }
        );

        if (response.status === 200) {
          toast.success("Review deleted successfully");
          setReviews((prev) => prev.filter((r) => r._id !== review._id));
          
          // Send notification to user
          postRequestSend(
            NOTIFICATION_API,
            { Authorization: `Bearer ${user?.token}` },
            {
              title: `Review Deleted`,
              userId: review.user.phone,
              message: `Your review "${review.title}" has been deleted by admin.`,
            }
          );
        } else {
          toast.error(response.message || "Failed to delete review");
        }
      } catch (error) {
        toast.error("Failed to delete review");
        console.error("Delete review error:", error);
      }
    }
  };

  // Handle status update
  const handleUpdateStatus = async (review: Review, newStatus: string) => {
    if (!canApprove) {
      toast.error("You do not have permission to update review status");
      return;
    }

    try {
      const response = await putRequestSend(
        SINGLE_REVIEW_API(review._id),
        { Authorization: `Bearer ${user?.token}` },
        { 
          ...review,
          status: newStatus,
          moderator: user?.id 
        }
      );

      if (response.status === 200) {
        toast.success(`Review ${newStatus} successfully`);
        setReviews((prev) =>
          prev.map((r) =>
            r._id === review._id
              ? { 
                  ...r, 
                  status: newStatus as Review["status"],
                  moderator: {
                    _id: user.id,
                    name: user.name,
                    phone: user.phone,
                  }
                }
              : r
          )
        );

        // Send notification to user
        postRequestSend(
          NOTIFICATION_API,
          { Authorization: `Bearer ${user?.token}` },
          {
            title: `Review ${newStatus}`,
            userId: review.user.phone,
            message: `Your review "${review.title}" has been ${newStatus} by ${user?.name}.`,
          }
        );
      } else {
        toast.error(response.message || "Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update review status");
      console.error("Update status error:", error);
    }
  };

  // Handle toggle public/private
  const handleTogglePublic = async (review: Review) => {
    if (!canManage && review.user._id !== user?.id) {
      toast.error("You do not have permission to update this review");
      return;
    }

    try {
      const response = await putRequestSend(
        SINGLE_REVIEW_API(review._id),
        { Authorization: `Bearer ${user?.token}` },
        { 
          ...review,
          isPublic: !review.isPublic 
        }
      );

      if (response.status === 200) {
        const visibility = !review.isPublic ? "public" : "private";
        toast.success(`Review made ${visibility}`);
        setReviews((prev) =>
          prev.map((r) =>
            r._id === review._id
              ? { ...r, isPublic: !r.isPublic }
              : r
          )
        );
      } else {
        toast.error(response.message || "Failed to update review visibility");
      }
    } catch (error) {
      toast.error("Failed to update review visibility");
      console.error("Toggle visibility error:", error);
    }
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  // Review Card Component (similar to PickupCard pattern)
  const ReviewCard = ({ review }: { review: Review }) => (
    <Card className="mb-4 py-2" data-testid={`review-card-${review._id}`}>
      <CardContent className="py-2 px-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {review.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-sm">{review.title}</p>
                {review.isPublic ? (
                  <Badge variant="secondary" className="text-xs">
                    <Eye className="w-3 h-3 mr-1" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    <EyeOff className="w-3 h-3 mr-1" />
                    Private
                  </Badge>
                )}
              </div>
              
              {canViewAll && (
                <p className="text-xs text-gray-500 mb-1">
                  by {review.user.name} ({review.user.phone})
                </p>
              )}
              
              <div className="mb-2">
                {renderStars(review.rating)}
              </div>
              
              <p className="text-sm text-gray-600">
                {review.comment.substring(0, 150)}
                {review.comment.length > 150 && '...'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge
              className={
                statusColors[review.status] || "bg-gray-100 text-gray-800"
              }
            >
              {review.status.toUpperCase()}
            </Badge>
            
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSelectedReview(review);
                  setIsViewModalOpen(true);
                }}
              >
                View
              </Button>

              {(canManage || review.user._id === user?.id) && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleTogglePublic(review)}
                  title={review.isPublic ? "Make private" : "Make public"}
                >
                  {review.isPublic ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              )}

              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteReview(review)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Status Action Buttons for Moderators */}
        {canApprove && review.status === "pending" && (
          <div className="flex gap-2 mb-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleUpdateStatus(review, "approved")}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              Approve
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleUpdateStatus(review, "rejected")}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <ThumbsDown className="h-3 w-3 mr-1" />
              Reject
            </Button>
          </div>
        )}

        {canManage && review.moderator && (
          <div className="text-xs text-gray-500 mb-2">
            Moderated by: {review.moderator.name}
          </div>
        )}

        <div className="text-xs text-gray-500">
          Submitted: {new Date(review.createdAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6" data-testid="reviews-page">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            data-testid="reviews-title"
          >
            {user?.role === "user" ? "My Reviews" : "Reviews Management"}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === "user"
              ? "Manage your submitted reviews and feedback"
              : user?.role === "moderator"
              ? "Moderate and approve customer reviews"
              : "Manage all customer reviews and feedback"}
          </p>
        </div>
        
        <AlertDialog
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
        >
          <AlertDialogTrigger asChild>
            <Button data-testid="create-review-btn" disabled={loading}>
              <Plus className="mr-2 h-4 w-4" />
              Submit Review
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent
            data-testid="create-review-modal"
            className="max-w-2xl"
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Submit New Review</AlertDialogTitle>
            </AlertDialogHeader>
            <form action={handleCreateReview} className="space-y-4">
              <div>
                <Label htmlFor="title">Review Title</Label>
                <Input 
                  id="title" 
                  name="title" 
                  placeholder="Brief title for your review"
                  required 
                />
              </div>

              <div>
                <Label htmlFor="rating">Rating</Label>
                <Select name="rating" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ (5) Excellent</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ (4) Good</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ (3) Average</SelectItem>
                    <SelectItem value="2">⭐⭐ (2) Poor</SelectItem>
                    <SelectItem value="1">⭐ (1) Very Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="comment">Review Comment</Label>
                <textarea
                  id="comment"
                  name="comment"
                  placeholder="Share your experience with our service..."
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  value="true"
                  defaultChecked
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isPublic" className="text-sm">
                  Make this review public (visible to other users)
                </Label>
              </div>

              <AlertDialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <AlertDialogAction asChild>
                  <Button
                    type="submit"
                    data-testid="create-review-submit"
                    disabled={loading}
                  >
                    {loading && (
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Submit Review
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
        <StatsCard
          title="Total Reviews"
          value={stats.total}
          icon={MessageSquare}
          trend="neutral"
        />
        <StatsCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          trend="neutral"
        />
        <StatsCard
          title="Approved"
          value={stats.approved}
          icon={CheckCircle}
          trend="up"
        />
        <StatsCard
          title="Rejected"
          value={stats.rejected}
          icon={XCircle}
          trend="down"
        />
        <StatsCard
          title="Public"
          value={stats.public}
          icon={Eye}
          trend="neutral"
        />
        <StatsCard
          title="Private"
          value={stats.private}
          icon={EyeOff}
          trend="neutral"
        />
        <StatsCard
          title="Avg Rating"
          value={stats.averageRating}
          icon={Star}
          trend="up"
        />
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
            data-testid="review-search-input"
          />
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterRating} onValueChange={setFilterRating}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">⭐⭐⭐⭐⭐ (5)</SelectItem>
            <SelectItem value="4">⭐⭐⭐⭐ (4)</SelectItem>
            <SelectItem value="3">⭐⭐⭐ (3)</SelectItem>
            <SelectItem value="2">⭐⭐ (2)</SelectItem>
            <SelectItem value="1">⭐ (1)</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterPublic} onValueChange={setFilterPublic}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="true">Public Only</SelectItem>
            <SelectItem value="false">Private Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List with InfiniteScroll */}
      <div data-testid="reviews-list">
        {initialLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoaderCircle className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading reviews...</span>
          </div>
        ) : (
          <InfiniteScroll
            dataLength={filteredReviews.length}
            next={fetchMoreReviews}
            hasMore={hasMore}
            loader={
              <div className="flex items-center justify-center py-4">
                <LoaderCircle className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading more reviews...</span>
              </div>
            }
            endMessage={
              <p className="text-center py-4 text-gray-500">
                {filteredReviews.length === 0
                  ? "No reviews found"
                  : "No more reviews to load"}
              </p>
            }
            scrollableTarget="scrollableDiv"
          >
            {filteredReviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </InfiniteScroll>
        )}
      </div>

      {/* View Review Modal */}
      <AlertDialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Review Details
            </AlertDialogTitle>
          </AlertDialogHeader>

          {selectedReview && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {selectedReview.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{selectedReview.title}</p>
                        <p className="text-sm text-gray-600">{selectedReview.user.name}</p>
                      </div>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[selectedReview.status]}>
                        {selectedReview.status.toUpperCase()}
                      </Badge>
                      {selectedReview.isPublic ? (
                        <Badge variant="secondary">
                          <Eye className="w-3 h-3 mr-1" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Private
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Rating:</p>
                    {renderStars(selectedReview.rating)}
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Review:</p>
                    <p className="text-gray-600 leading-relaxed">{selectedReview.comment}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
                    {canViewAll && (
                      <>
                        <div>
                          <p className="font-medium text-gray-700">Customer:</p>
                          <p className="text-gray-600">{selectedReview.user.name}</p>
                          <p className="text-gray-600 text-xs">{selectedReview.user.phone}</p>
                        </div>
                      </>
                    )}
                    
                    <div>
                      <p className="font-medium text-gray-700">Submitted:</p>
                      <p className="text-gray-600">
                        {new Date(selectedReview.createdAt).toLocaleString()}
                      </p>
                    </div>
                    
                    {selectedReview.moderator && (
                      <div>
                        <p className="font-medium text-gray-700">Moderated by:</p>
                        <p className="text-gray-600">{selectedReview.moderator.name}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="font-medium text-gray-700">Last Updated:</p>
                      <p className="text-gray-600">
                        {new Date(selectedReview.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <AlertDialogFooter>
            {selectedReview && canApprove && selectedReview.status === "pending" && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    handleUpdateStatus(selectedReview, "approved");
                    setIsViewModalOpen(false);
                  }}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleUpdateStatus(selectedReview, "rejected");
                    setIsViewModalOpen(false);
                  }}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            )}
            <AlertDialogAction onClick={() => setIsViewModalOpen(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardReviews;