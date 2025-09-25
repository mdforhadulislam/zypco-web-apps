// export const ROOT = `https://zypco.vercel.app/`;
export const ROOT = `http://localhost:3000/`;

export const ROOT_API = `${ROOT}api/v1/`;

export const SIGNIN_API = `${ROOT_API}auth/signin`;
export const SIGNUP_API = `${ROOT_API}auth/signup`;
export const SIGNOUT_API = `${ROOT_API}auth/signout`;
export const EMAIL_VERIFY_API = `${ROOT_API}auth/email-verify`;
export const REFRESH_TOKEN = `${ROOT_API}auth/refresh-token`

export const ACCOUNT_API = `${ROOT_API}accounts/`;
export const SINGLE_ACCOUNT_API = (phone: string) =>`${ROOT_API}accounts/${phone}`;

export const SINGLE_ACCOUNT_ADDRESS_API = (phone: string) =>`${ROOT_API}accounts/${phone}/address}`;
export const SINGLE_ACCOUNT_SINGLE_ADDRESS_API = (phone: string,addressId: string) => `${ROOT_API}accounts/${phone}/address/${addressId}`;

export const SINGLE_ACCOUNT_APICONFIG_API = (phone: string) =>`${ROOT_API}accounts/${phone}/api-config/`;
export const SINGLE_ACCOUNT_APICONFIG_ACCESSLOG_API = (phone: string) =>`${ROOT_API}accounts/${phone}/api-config/access-log/`;
export const SINGLE_ACCOUNT_SINGLE_APICONFIG_SINGLE_ACCESSLOG_API = (phone: string,apiaccessId: string) => `${ROOT_API}accounts/${phone}/api-config/access-log/${apiaccessId}`;

export const SINGLE_ACCOUNT_PERMISSION_API = (phone: string) =>`${ROOT_API}accounts/${phone}/permissions`;

export const SINGLE_ACCOUNT_PICKUP_API = (phone: string) =>`${ROOT_API}accounts/${phone}/pickup/`;
export const SINGLE_ACCOUNT_SINGLE_PICKUP_API = (phone: string,pickupId: string) => `${ROOT_API}accounts/${phone}/pickup/${pickupId}`;

export const SINGLE_ACCOUNT_REVIEW_API = (phone: string) =>`${ROOT_API}accounts/${phone}/review`;
export const SINGLE_ACCOUNT_SINGLE_REVIEW_API = (phone: string,reviewId: string) => `${ROOT_API}accounts/${phone}/review/${reviewId}`;

export const SINGLE_ACCOUNT_NOTIFICATIONS = (phone: string) =>`${ROOT_API}accounts/${phone}/notifications/`;
export const SINGLE_ACCOUNT_SINGLE_NOTIFICATIONS = (phone: string,notificationId: string) => `${ROOT_API}accounts/${phone}/notifications/${notificationId}`;

export const SINGLE_ACCOUNT_OFFER = (phone: string) =>`${ROOT_API}accounts/${phone}/offers`;

export const SINGLE_ACCOUNT_ORDER_API = (phone: string) =>`${ROOT_API}accounts/${phone}/order`;
export const SINGLE_ACCOUNT_SINGLE_ORDER_API = (phone: string,orderId: string) => `${ROOT_API}accounts/${phone}/order/${orderId}`;

// New API endpoints for orders and tracking
export const ORDERS_API = `${ROOT_API}orders`;
export const SINGLE_ORDER_API = (orderId: string) =>`${ROOT_API}orders/${orderId}`;
export const ORDER_PAYMENT_API = (orderId: string) => `${ROOT_API}orders/${orderId}/payment`;

export const TRACKS_API = `${ROOT_API}tracks`;
export const SINGLE_TRACK_API = (trackId: string) =>`${ROOT_API}tracks/${trackId}`;

export const BLOG_API = `${ROOT_API}blogs/`
export const SINGLE_BLOG_API =(bloogId:string)=> `${ROOT_API}blogs/${bloogId}`

export const CONTACT_API = `${ROOT_API}contacts/`
export const SINGLE_CONTACT_API=(contactId:string) => `${ROOT_API}contacts/${contactId}`

export const NOTIFICATION_API = `${ROOT_API}notifications/`
export const SINGLE_NOTIFICATION_API=(notificationId:string) => `${ROOT_API}notifications/${notificationId}`

export const OFFER_API = `${ROOT_API}offer/`
export const SINGLE_OFFER_API=(offerId:string) => `${ROOT_API}offers/${offerId}`

export const PICKUP_API = `${ROOT_API}pickups/`
export const SINGLE_PICKUP_API=(pickupId:string) => `${ROOT_API}pickups/${pickupId}`

export const PRICE_API = `${ROOT_API}prices/`
export const SINGLE_PRICE_API=(priceId:string) => `${ROOT_API}prices/${priceId}`

export const REVIEW_API = `${ROOT_API}reviews/`
export const SINGLE_REVIEW_API=(reviewId:string) => `${ROOT_API}reviews/${reviewId}`

 
export const ROOT_ANALAYTICS_API = `${ROOT_API}analaytics/`
export const ADDRESS_ANALAYTICS_API = `${ROOT_API}analaytics/addresses-analytics`
export const API_KEY_ANALAYTICS_API = `${ROOT_API}analaytics/api-keys-analytics`
export const CONTACT_ANALAYTICS_API = `${ROOT_API}analaytics/contacts-analytics`
export const CONTENT_ANALAYTICS_API = `${ROOT_API}analaytics/content-analytics`
export const COUNTRIES_ANALAYTICS_API = `${ROOT_API}analaytics/countries-analytics`
export const LOGIN_ANALAYTICS_API = `${ROOT_API}analaytics/login-analytics`
export const NOTIFICATION_ANALAYTICS_API = `${ROOT_API}analaytics/notifications-analytics`
export const OFFER_ANALAYTICS_API = `${ROOT_API}analaytics/offers-analytics`
export const OPERATIONAL_ANALAYTICS_API = `${ROOT_API}analaytics/operational-analytics`
export const ORDER_ANALAYTICS_API = `${ROOT_API}analaytics/order-analytics`
export const REVENUE_ANALAYTICS_API = `${ROOT_API}analaytics/revenue-analytics`
export const REVIEW_ANALAYTICS_API = `${ROOT_API}analaytics/reviews-analytics`
export const USER_ANALAYTICS_API = `${ROOT_API}analaytics/user-analytics`
