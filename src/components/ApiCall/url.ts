export const ROOT = `https://zypco.vercel.app/`;
// export const ROOT = `http://localhost:3000/`;
export const ROOT_API = `${ROOT}api/v1/`;

export const SIGNIN_API = `${ROOT_API}auth/signin`;
export const SIGNUP_API = `${ROOT_API}auth/signup`;
export const SIGNOUT_API = `${ROOT_API}auth/signout`;
export const EMAIL_VERIFY_API = `${ROOT_API}auth/email-verify`;

export const ACCOUNT_API = `${ROOT_API}accounts/`;
export const SINGLE_ACCOUNT_API = (phone: string) =>
  `${ROOT_API}accounts/${phone}`;

export const SINGLE_ACCOUNT_ADDRESS_API = (phone: string) =>
  `${ROOT_API}accounts/${phone}/address`;
export const SINGLE_ACCOUNT_SINGLE_ADDRESS_API = (
  phone: string,
  addressId: string
) => `${ROOT_API}accounts/${phone}/address/${addressId}`;

export const SINGLE_ACCOUNT_APICONFIG_API = (phone: string) =>
  `${ROOT_API}accounts/${phone}/api-config/`;
export const SINGLE_ACCOUNT_APICONFIG_ACCESSLOG_API = (phone: string) =>
  `${ROOT_API}accounts/${phone}/api-config/access-log/`;
export const SINGLE_ACCOUNT_SINGLE_APICONFIG_SINGLE_ACCESSLOG_API = (
  phone: string,
  apiaccessId: string
) => `${ROOT_API}accounts/${phone}/api-config/access-log/${apiaccessId}`;

export const SINGLE_ACCOUNT_PERMISSION_API = (phone: string) =>
  `${ROOT_API}accounts/${phone}/permissions`;

export const SINGLE_ACCOUNT_PICKUP_API = (phone: string) =>
  `${ROOT_API}accounts/${phone}/pickup/`;
export const SINGLE_ACCOUNT_SINGLE_PICKUP_API = (
  phone: string,
  pickupId: string
) => `${ROOT_API}accounts/${phone}/pickup/${pickupId}`;

export const SINGLE_ACCOUNT_REVIEW_API = (phone: string) =>
  `${ROOT_API}accounts/${phone}/review`;
export const SINGLE_ACCOUNT_SINGLE_REVIEW_API = (
  phone: string,
  reviewId: string
) => `${ROOT_API}accounts/${phone}/review/${reviewId}`;

export const SINGLE_ACCOUNT_NOTIFICATIONS = (phone: string) =>
  `${ROOT_API}accounts/${phone}/notifications/`;
export const SINGLE_ACCOUNT_SINGLE_NOTIFICATIONS = (
  phone: string,
  notificationId: string
) => `${ROOT_API}accounts/${phone}/notifications/${notificationId}`;

export const SINGLE_ACCOUNT_OFFER = (phone: string) =>
  `${ROOT_API}accounts/${phone}/offers`;

export const SINGLE_ACCOUNT_ORDER_API = (phone: string) =>
  `${ROOT_API}accounts/${phone}/order`;
export const SINGLE_ACCOUNT_SINGLE_ORDER_API = (
  phone: string,
  orderId: string
) => `${ROOT_API}accounts/${phone}/order/${orderId}`;

// New API endpoints for orders and tracking
export const ORDERS_API = `${ROOT_API}orders`;
export const SINGLE_ORDER_API = (orderId: string) =>
  `${ROOT_API}orders/${orderId}`;
export const ORDER_PAYMENT_API = (orderId: string) =>
  `${ROOT_API}orders/${orderId}/payment`;

export const TRACKS_API = `${ROOT_API}tracks`;
export const SINGLE_TRACK_API = (trackId: string) =>
  `${ROOT_API}tracks/${trackId}`;
