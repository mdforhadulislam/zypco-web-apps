import {
  BadgeDollarSign,
  BarChart3,
  Bell,
  Boxes,
  BoxIcon,
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
      items: [],
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChart3,
      items: [],
    },
    {
      title: "Pickups",
      url: "/dashboard/pickups",
      icon: Package,
      items: [],
    },
    {
      title: "Rate Charts",
      url: "/dashboard/rate-charts",
      icon: BadgeDollarSign,
      items: [
        {
          title: "countrys",
          url: "/dashboard/rate-charts/countrys",
        },
        {
          title: "Rate Charts",
          url: "/dashboard/rate-charts",
        },
        {
          title: "Address Book",
          url: "/dashboard/rate-charts/address",
        },
      ],
    },
    {
      title: "Orders",
      url: "/dashboard/orders",
      icon: Boxes,
      items: [],
    },
    {
      title: "Parcel Tracking",
      url: "/dashboard/orders",
      icon: BoxIcon,
      items: [],
    },
    {
      title: "Reviews",
      url: "/dashboard/reviews",
      icon: UserStar,
      items: [],
    },
    {
      title: "Content",
      url: "/dashboard/contents",
      icon: Rss,
      items: [
        {
          title: "All Contact",
          url: "/dashboard/contact",
        },
        {
          title: "Blog Posts",
          url: "/dashboard/contents/blogs",
        },
      ],
    },
    {
      title: "Notifications",
      url: "/dashboard/notifications",
      icon: Bell,
      items: [],
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
          title: "Address",
          url: "/dashboard/settings/address",
        },
        {
          title: "Offers",
          url: "/dashboard/settings/offers",
        },
        {
          title: "Api Key",
          url: "/dashboard/settings/api-config-and-access",
        },
        {
          title: "Account Activity",
          url: "/dashboard/settings/login-history",
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
      items: [],
    },
    {
      title: "Pickups",
      url: "/dashboard/pickups",
      icon: Package,
      items: [],
    },
    {
      title: "Rate Charts",
      url: "/dashboard/rate-charts",
      icon: BadgeDollarSign,
      items: [
        {
          title: "Countrys",
          url: "/dashboard/rate-charts/countrys",
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
      items: [],
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
          title: "All Contacts",
          url: "/dashboard/contents",
        },
        {
          title: "Blog Posts",
          url: "/dashboard/contents/blogs",
        },
      ],
    },
    {
      title: "Notifications",
      url: "/dashboard/notifications",
      icon: Bell,
      items: [
        {
          title: "All Notifications",
          url: "/dashboard/notifications",
        },
        {
          title: "Unread Notifications",
          url: "/dashboard/notifications?read=false",
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
          title: "Address",
          url: "/dashboard/settings/address",
        },

        {
          title: "Api Key",
          url: "/dashboard/settings/api-config-and-access",
        },
        {
          title: "Account Activity",
          url: "/dashboard/settings/login-history",
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
      items: [],
    },
    {
      title: "Pickups",
      url: "/dashboard/pickups",
      icon: Package,
      items: [],
    },
    {
      title: "Rate Charts",
      url: "/dashboard/rate-charts",
      icon: BadgeDollarSign,
      items: [
        {
          title: "Countrys",
          url: "/dashboard/rate-charts/countrys",
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
        {
          title: "Login History",
          url: "/dashboard/settings/login-history",
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
