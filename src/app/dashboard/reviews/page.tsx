"use client";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/AuthContext";
import { useReviews, useApiMutation } from "@/hooks/UserApi";
import { REVIEW_API, REVIEW_BY_ID_API } from "@/components/ApiCall/url";
import {
  Eye,
  Filter,
  Star,
  Plus,
  Search,
  Edit,
  Trash2,
  User,
  CheckCircle,
  XCircle,
  ThumbsUp,
  MessageSquare,
  Award,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  isVerified: boolean;
  isFeatured: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

// Star Rating Component
function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600">({rating})</span>
    </div>
  );
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Build filter params
  const filterParams = {
    page,
    limit: 20,
    ...(search && { search }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(ratingFilter !== "all" && { rating: parseInt(ratingFilter) }),
  };

  const {
    data: reviews,
    meta,
    isLoading,
    error,
    mutate: refreshReviews,
  } = useReviews(filterParams);

  const { mutateApi } = useApiMutation();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "approved":
        return <Badge variant="default" className="bg-green-600">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleStatusUpdate = async (reviewId: string, newStatus: string) => {
    await mutateApi(REVIEW_BY_ID_API(reviewId), {
      method: "PUT",
      data: { status: newStatus },
      successMessage: `Review ${newStatus} successfully`,
      onSuccess: () => {
        refreshReviews();
        setShowReviewDialog(false);
      },
    });
  };

  const handleToggleFeature = async (reviewId: string, isFeatured: boolean) => {
    await mutateApi(REVIEW_BY_ID_API(reviewId), {
      method: "PUT",
      data: { isFeatured: !isFeatured },
      successMessage: `Review ${!isFeatured ? 'featured' : 'unfeatured'} successfully`,
      onSuccess: () => {
        refreshReviews();
        setShowReviewDialog(false);
      },
    });
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    await mutateApi(REVIEW_BY_ID_API(reviewId), {
      method: "DELETE",
      successMessage: "Review deleted successfully",
      onSuccess: () => {
        refreshReviews();
        setShowReviewDialog(false);
      },
    });
  };

  const handleCreateReview = async (reviewData: any) => {
    await mutateApi(REVIEW_API, {
      method: "POST",
      data: reviewData,
      successMessage: "Review created successfully",
      onSuccess: () => {
        refreshReviews();
        setShowCreateDialog(false);
      },
    });
  };

  // Check permissions
  const canModerateReviews = user?.role === "admin" || user?.role === "moderator";
  const canCreateReviews = true; // All users can create reviews

  return (
    <div className="space-y-6" data-testid="reviews-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Star className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Reviews Management</h1>
        </div>
        {canCreateReviews && (
          <Button 
            onClick={() => setShowCreateDialog(true)}
            data-testid="create-review-button"
          >
            <Plus className="mr-2 h-4 w-4" />
            Write Review
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold">{meta?.total || 0}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                <p className="text-2xl font-bold">
                  {reviews?.filter((r: Review) => r.status === "pending").length || 0}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved Reviews</p>
                <p className="text-2xl font-bold">
                  {reviews?.filter((r: Review) => r.status === "approved").length || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold">
                  {reviews?.length ? (
                    (reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / reviews.length).toFixed(1)
                  ) : "0.0"}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search reviews..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="status-filter">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="rating-filter">Rating</Label>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger data-testid="rating-filter">
                  <SelectValue placeholder="All ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ratings</SelectItem>
                  <SelectItem value="5">5 stars</SelectItem>
                  <SelectItem value="4">4 stars</SelectItem>
                  <SelectItem value="3">3 stars</SelectItem>
                  <SelectItem value="2">2 stars</SelectItem>
                  <SelectItem value="1">1 star</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setRatingFilter("all");
                  setPage(1);
                }}
                data-testid="clear-filters"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews ({meta?.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Failed to load reviews</p>
              <Button onClick={() => refreshReviews()} className="mt-2">
                Retry
              </Button>
            </div>
          ) : (
            <>
              <Table data-testid="reviews-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Features</TableHead>
                    <TableHead>Helpful</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews?.map((review: Review) => (
                    <TableRow key={review._id} data-testid={`review-row-${review._id}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            {review.user?.avatar ? (
                              <img
                                src={review.user.avatar}
                                alt={review.user.name}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <span className="text-sm font-medium">
                                {review.user?.name?.charAt(0)?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{review.user?.name}</p>
                            <p className="text-xs text-gray-500">{review.user?.email}</p>
                            {review.isVerified && (
                              <Badge variant="secondary" className="mt-1 text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StarRating rating={review.rating} size="sm" />
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm line-clamp-2">{review.comment}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(review.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {review.isFeatured && (
                            <Badge variant="default" className="bg-purple-600">
                              <Award className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          {review.isVerified && (
                            <Badge variant="secondary">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{review.helpfulCount || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedReview(review);
                              setShowReviewDialog(true);
                            }}
                            data-testid={`view-review-${review._id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canModerateReviews && (
                            <>
                              {review.status === "pending" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusUpdate(review._id, "approved")}
                                    className="text-green-600 hover:text-green-700"
                                    data-testid={`approve-review-${review._id}`}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusUpdate(review._id, "rejected")}
                                    className="text-red-600 hover:text-red-700"
                                    data-testid={`reject-review-${review._id}`}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleFeature(review._id, review.isFeatured)}
                                className={review.isFeatured ? "text-purple-600" : "text-gray-600"}
                                data-testid={`feature-review-${review._id}`}
                              >
                                <Award className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteReview(review._id)}
                                className="text-red-600 hover:text-red-700"
                                data-testid={`delete-review-${review._id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-700">
                    Showing {((meta.page - 1) * 20) + 1} to {Math.min(meta.page * 20, meta.total)} of {meta.total} reviews
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                      data-testid="prev-page"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      disabled={page >= meta.totalPages}
                      onClick={() => setPage(page + 1)}
                      data-testid="next-page"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Review Details Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-2xl" data-testid="review-details-dialog">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>
              Complete review information and moderation actions
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-6">
              {/* Reviewer Info */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  {selectedReview.user?.avatar ? (
                    <img
                      src={selectedReview.user.avatar}
                      alt={selectedReview.user.name}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <span className="text-xl font-medium">
                      {selectedReview.user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium">{selectedReview.user?.name}</h3>
                  <p className="text-gray-600">{selectedReview.user?.email}</p>
                  <p className="text-gray-500 text-sm">{selectedReview.user?.phone}</p>
                </div>
              </div>

              {/* Review Content */}
              <div className="space-y-4">
                <div>
                  <Label>Rating</Label>
                  <StarRating rating={selectedReview.rating} size="lg" />
                </div>
                
                <div>
                  <Label>Comment</Label>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedReview.comment}</p>
                  </div>
                </div>
              </div>

              {/* Review Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  {getStatusBadge(selectedReview.status)}
                </div>
                <div>
                  <Label>Helpful Count</Label>
                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="h-4 w-4 text-gray-400" />
                    <span>{selectedReview.helpfulCount || 0}</span>
                  </div>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="text-sm">{new Date(selectedReview.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label>Updated</Label>
                  <p className="text-sm">{new Date(selectedReview.updatedAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {selectedReview.isVerified && (
                  <Badge variant="secondary">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified Review
                  </Badge>
                )}
                {selectedReview.isFeatured && (
                  <Badge variant="default" className="bg-purple-600">
                    <Award className="h-3 w-3 mr-1" />
                    Featured Review
                  </Badge>
                )}
              </div>

              {/* Moderation Actions */}
              {canModerateReviews && (
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  {selectedReview.status === "pending" && (
                    <>
                      <Button
                        onClick={() => handleStatusUpdate(selectedReview._id, "approved")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve Review
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleStatusUpdate(selectedReview._id, "rejected")}
                        className="text-red-600 hover:text-red-700"
                      >
                        Reject Review
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleToggleFeature(selectedReview._id, selectedReview.isFeatured)}
                    className={selectedReview.isFeatured ? "text-purple-600" : "text-gray-600"}
                  >
                    {selectedReview.isFeatured ? "Unfeature" : "Feature"} Review
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteReview(selectedReview._id)}
                  >
                    Delete Review
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Review Dialog would go here */}
    </div>
  );
}