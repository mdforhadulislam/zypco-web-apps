import {
  BarChart3,
  BadgeDollarSign,
  Bot,
  Boxes,
  CircleUserRound,
  LayoutDashboard,
  LifeBuoy,
  Package,
  Rss,
  Send,
  Settings2,
  UserStar,
} from "lucide-react";

export const AdminData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Analaytics",
          url: "/dashboard/analytics",
        },
        {
          title: "All Pickup",
          url: "/dashboard/pickups",
        },
        {
          title: "All Order",
          url: "/dashboard/orders",
        },
      ],
    },
    {
      title: "Analaytics",
      url: "/dashboard/analaytics",
      icon: BarChart3,
      items: [
        {
          title: "User Analaytics",
          url: "/dashboard/analaytics/users",
        },
        {
          title: "Login Analaytics",
          url: "/dashboard/analaytics/login",
        },
        {
          title: "Revenue Analaytics",
          url: "/dashboard/analaytics/revenue",
        },
        {
          title: "API Key Analaytics",
          url: "/dashboard/analaytics/api-keys",
        },
        {
          title: "Addresses Analaytics",
          url: "/dashboard/analaytics/addresses",
        },
        {
          title: "Order Analaytics",
          url: "/dashboard/analaytics/orders",
        },
        {
          title: "Operational Analaytics",
          url: "/dashboard/analaytics/operational",
        },
        {
          title: "Offers Analaytics",
          url: "/dashboard/analaytics/offers",
        },
        {
          title: "Countries Analaytics",
          url: "/dashboard/analaytics/countries",
        },
        {
          title: "Notifications Analaytics",
          url: "/dashboard/analaytics/notifications",
        },
        {
          title: "Contacts Analaytics",
          url: "/dashboard/analaytics/contacts",
        },
        {
          title: "Content Analaytics",
          url: "/dashboard/analaytics/content",
        },
        {
          title: "Reviews Analaytics",
          url: "/dashboard/analaytics/reviews",
        },
      ],
    },
    {
      title: "Pickups",
      url: "/dashboard/pickups",
      icon: Package,
      items: [
        {
          title: "All Pickup",
          url: "/dashboard/pickups",
        },
        {
          title: "Pending Pickup",
          url: "/dashboard/pickups?status=pending",
        },
        {
          title: "Cancel Pickup",
          url: "/dashboard/pickups?status=cancelled",
        },
        {
          title: "Done Pickup",
          url: "/dashboard/pickups?status=completed",
        },
      ],
    },
    {
      title: "Rate Charts",
      url: "/dashboard/rate-charts",
      icon: BadgeDollarSign,
      items: [
        {
          title: "Countries",
          url: "/dashboard/rate-charts/countries",
        },
        {
          title: "Rate Charts",
          url: "/dashboard/rate-charts",
        },
      ],
    },
    {
      title: "Orders",
      url: "/dashboard/orders",
      icon: Boxes,
      items: [
        {
          title: "All Orders",
          url: "/dashboard/orders",
        },
        {
          title: "Normal Order",
          url: "/dashboard/orders?type=normal",
        },
        {
          title: "Express Order",
          url: "/dashboard/orders?type=express",
        },
        {
          title: "Super Express",
          url: "/dashboard/orders?type=super-express",
        },
        {
          title: "Tax Paid",
          url: "/dashboard/orders?status=tax-paid",
        },
      ],
    },
    {
      title: "Reviews",
      url: "/dashboard/reviews",
      icon: UserStar,
      items: [
        {
          title: "All Reviews",
          url: "/dashboard/reviews",
        },
        {
          title: "Pending Reviews",
          url: "/dashboard/reviews?status=pending",
        },
        {
          title: "Approved Reviews",
          url: "/dashboard/reviews?status=approved",
        },
      ],
    },
    {
      title: "Content",
      url: "/dashboard/contents",
      icon: Rss,
      items: [
        {
          title: "All Content",
          url: "/dashboard/contents",
        },
        {
          title: "Blog Posts",
          url: "/dashboard/contents/blogs",
        },
        {
          title: "Notifications",
          url: "/dashboard/contents/notifications",
        },
      ],
    },
    {
      title: "Users",
      url: "/dashboard/users",
      icon: CircleUserRound,
      items: [
        {
          title: "All Users",
          url: "/dashboard/users",
        },
        {
          title: "Normal User",
          url: "/dashboard/users?role=user",
        },
        {
          title: "Admin Users",
          url: "/dashboard/users?role=admin",
        },
        {
          title: "Moderator User",
          url: "/dashboard/users?role=moderator",
        },
      ],
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "/dashboard/settings",
        },
        {
          title: "Offers",
          url: "/dashboard/settings/offers",
        },
        {
          title: "Api Key",
          url: "/dashboard/settings/api-keys",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "/dashboard/support",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "/dashboard/feedback",
      icon: Send,
    },
  ],
};

export const ModaretorData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Analytics",
          url: "/dashboard/analytics",
        },
        {
          title: "All Pickup",
          url: "/dashboard/pickups",
        },
        {
          title: "All Order",
          url: "/dashboard/orders",
        },
      ],
    },
    {
      title: "Pickups",
      url: "/dashboard/pickups",
      icon: Package,
      items: [
        {
          title: "All Pickup",
          url: "/dashboard/pickups",
        },
        {
          title: "Pending Pickup",
          url: "/dashboard/pickups?status=pending",
        },
        {
          title: "Cancel Pickup",
          url: "/dashboard/pickups?status=cancelled",
        },
        {
          title: "Done Pickup",
          url: "/dashboard/pickups?status=completed",
        },
      ],
    },
    {
      title: "Rate Charts",
      url: "/dashboard/rate-charts",
      icon: BadgeDollarSign,
      items: [
        {
          title: "Countries",
          url: "/dashboard/rate-charts/countries",
        },
        {
          title: "Rate Charts",
          url: "/dashboard/rate-charts",
        },
      ],
    },
    {
      title: "Orders",
      url: "/dashboard/orders",
      icon: Boxes,
      items: [
        {
          title: "All Orders",
          url: "/dashboard/orders",
        },
        {
          title: "Normal Order",
          url: "/dashboard/orders?type=normal",
        },
        {
          title: "Express Order",
          url: "/dashboard/orders?type=express",
        },
        {
          title: "Super Express",
          url: "/dashboard/orders?type=super-express",
        },
        {
          title: "Tax Paid",
          url: "/dashboard/orders?status=tax-paid",
        },
      ],
    },
    {
      title: "Reviews",
      url: "/dashboard/reviews",
      icon: UserStar,
      items: [
        {
          title: "All Reviews",
          url: "/dashboard/reviews",
        },
        {
          title: "Pending Reviews",
          url: "/dashboard/reviews?status=pending",
        },
        {
          title: "Approved Reviews",
          url: "/dashboard/reviews?status=approved",
        },
      ],
    },
    {
      title: "Content",
      url: "/dashboard/contents",
      icon: Rss,
      items: [
        {
          title: "All Content",
          url: "/dashboard/contents",
        },
        {
          title: "Blog Posts",
          url: "/dashboard/contents/blogs",
        },
      ],
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "/dashboard/settings",
        },
        {
          title: "Offers",
          url: "/dashboard/settings/offers",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "/dashboard/support",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "/dashboard/feedback",
      icon: Send,
    },
  ],
};

export const UserData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "My Orders",
          url: "/dashboard/orders",
        },
        {
          title: "My Pickups",
          url: "/dashboard/pickups",
        },
      ],
    },
    {
      title: "Pickups",
      url: "/dashboard/pickups",
      icon: Package,
      items: [
        {
          title: "All Pickup",
          url: "/dashboard/pickups",
        },
        {
          title: "Pending Pickup",
          url: "/dashboard/pickups?status=pending",
        },
        {
          title: "Done Pickup",
          url: "/dashboard/pickups?status=completed",
        },
      ],
    },
    {
      title: "Rate Charts",
      url: "/dashboard/rate-charts",
      icon: BadgeDollarSign,
      items: [
        {
          title: "Countries",
          url: "/dashboard/rate-charts/countries",
        },
        {
          title: "Rate Charts",
          url: "/dashboard/rate-charts",
        },
      ],
    },
    {
      title: "Orders",
      url: "/dashboard/orders",
      icon: Boxes,
      items: [
        {
          title: "My Orders",
          url: "/dashboard/orders",
        },
        {
          title: "Track Orders",
          url: "/dashboard/orders/track",
        },
      ],
    },
    {
      title: "Reviews",
      url: "/dashboard/reviews",
      icon: UserStar,
      items: [
        {
          title: "My Reviews",
          url: "/dashboard/reviews",
        },
        {
          title: "Write Review",
          url: "/dashboard/reviews/new",
        },
      ],
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings2,
      items: [
        {
          title: "Profile",
          url: "/dashboard/settings",
        },
        {
          title: "Addresses",
          url: "/dashboard/settings/addresses",
        },
        {
          title: "API Keys",
          url: "/dashboard/settings/api-keys",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "/dashboard/support",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "/dashboard/feedback",
      icon: Send,
    },
  ],
};