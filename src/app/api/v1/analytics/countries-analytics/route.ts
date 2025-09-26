import connectDB from "@/config/db";
import { createModeratorHandler } from "@/server/common/apiWrapper";
import { successResponse, errorResponse } from "@/server/common/response";
import { Order } from "@/server/models/Order.model";
import { Address } from "@/server/models/Address.model";

export const GET = createModeratorHandler(async ({ req, user }) => {
  try {
    await connectDB();

    // Verify admin/moderator access
    if (!user || (user.role !== "admin" && user.role !== "moderator")) {
      return errorResponse({
        status: 403,
        message: "Admin or moderator access required",
        req,
      });
    }

    const url = new URL(req.url);
    const params = url.searchParams;

    const startDateParam = params.get("startDate");
    const endDateParam = params.get("endDate");
    const days = parseInt(params.get("days") || "30", 10);
    const limit = parseInt(params.get("limit") || "20", 10);

    // Build date bounds
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    
    if (startDateParam) startDate = new Date(startDateParam);
    if (endDateParam) {
      endDate = new Date(endDateParam);
      endDate.setHours(23, 59, 59, 999);
    }

    const pastNDays = new Date();
    pastNDays.setDate(now.getDate() - days + 1);

    // Build match query
    const matchQuery: any = {};
    if (startDate) matchQuery.createdAt = { $gte: startDate };
    else matchQuery.createdAt = { $gte: pastNDays };
    if (endDate) {
      matchQuery.createdAt = matchQuery.createdAt || {};
      matchQuery.createdAt.$lte = endDate;
    }

    // Execute country analytics queries in parallel
    const [
      topOriginCountries,
      topDestinationCountries,
      countryPairRoutes,
      revenueByCountry,
      addressesByCountry,
    ] = await Promise.all([
      // Top origin countries
      Order.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$parcel.from",
            orders: { $sum: 1 },
            revenue: { $sum: { $ifNull: ["$payment.pReceived", 0] } },
            avgOrderValue: { $avg: { $ifNull: ["$payment.pReceived", 0] } }
          }
        },
        { $sort: { orders: -1 } },
        { $limit: limit },
        {
          $project: {
            _id: 0,
            country: "$_id",
            orders: 1,
            revenue: 1,
            avgOrderValue: 1
          }
        }
      ]),

      // Top destination countries
      Order.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$parcel.to",
            orders: { $sum: 1 },
            revenue: { $sum: { $ifNull: ["$payment.pReceived", 0] } },
            avgOrderValue: { $avg: { $ifNull: ["$payment.pReceived", 0] } }
          }
        },
        { $sort: { orders: -1 } },
        { $limit: limit },
        {
          $project: {
            _id: 0,
            country: "$_id",
            orders: 1,
            revenue: 1,
            avgOrderValue: 1
          }
        }
      ]),

      // Most popular country-to-country routes
      Order.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              from: "$parcel.from",
              to: "$parcel.to"
            },
            orders: { $sum: 1 },
            revenue: { $sum: { $ifNull: ["$payment.pReceived", 0] } }
          }
        },
        { $sort: { orders: -1 } },
        { $limit: limit },
        {
          $project: {
            _id: 0,
            route: { $concat: ["$_id.from", " → ", "$_id.to"] },
            fromCountry: "$_id.from",
            toCountry: "$_id.to",
            orders: 1,
            revenue: 1
          }
        }
      ]),

      // Revenue breakdown by country (combined origin + destination)
      Order.aggregate([
        { $match: matchQuery },
        {
          $facet: {
            fromCountries: [
              {
                $group: {
                  _id: "$parcel.from",
                  revenue: { $sum: { $ifNull: ["$payment.pReceived", 0] } }
                }
              }
            ],
            toCountries: [
              {
                $group: {
                  _id: "$parcel.to",
                  revenue: { $sum: { $ifNull: ["$payment.pReceived", 0] } }
                }
              }
            ]
          }
        },
        {
          $project: {
            combined: { $concatArrays: ["$fromCountries", "$toCountries"] }
          }
        },
        { $unwind: "$combined" },
        {
          $group: {
            _id: "$combined._id",
            totalRevenue: { $sum: "$combined.revenue" }
          }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: limit },
        {
          $project: {
            _id: 0,
            country: "$_id",
            totalRevenue: 1
          }
        }
      ]),

      // Addresses by country (if Address model exists)
      Address.aggregate([
        {
          $group: {
            _id: "$country",
            addressCount: { $sum: 1 },
            activeAddresses: {
              $sum: { $cond: ["$isActive", 1, 0] }
            }
          }
        },
        { $sort: { addressCount: -1 } },
        { $limit: limit },
        {
          $project: {
            _id: 0,
            country: "$_id",
            addressCount: 1,
            activeAddresses: 1
          }
        }
      ]).catch(() => []) // Ignore error if Address model doesn't exist
    ]);

    // Calculate additional metrics
    const totalOrders = topOriginCountries.reduce((sum, country) => sum + country.orders, 0) +
                       topDestinationCountries.reduce((sum, country) => sum + country.orders, 0);

    const totalRevenue = revenueByCountry.reduce((sum, country) => sum + country.totalRevenue, 0);

    const countryCount = new Set([
      ...topOriginCountries.map(c => c.country),
      ...topDestinationCountries.map(c => c.country)
    ]).size;

    // Top performers
    const topRevenueCountry = revenueByCountry[0];
    const topOrdersOrigin = topOriginCountries[0];
    const topOrdersDestination = topDestinationCountries[0];
    const topRoute = countryPairRoutes[0];

    // Market penetration analysis
    const marketPenetration = {
      totalCountriesServed: countryCount,
      topMarkets: revenueByCountry.slice(0, 5),
      emergingMarkets: revenueByCountry.slice(-5).reverse(),
      routeConcentration: {
        topRoute: topRoute?.route,
        topRouteShare: totalOrders > 0 ? (topRoute?.orders / totalOrders * 100) : 0,
        diversityIndex: countryPairRoutes.length // Simple diversity measure
      }
    };

    // Prepare analytics response
    const analytics = {
      summary: {
        totalCountriesServed: countryCount,
        totalOrders,
        totalRevenue,
        avgRevenuePerCountry: countryCount > 0 ? totalRevenue / countryCount : 0,
        period: {
          start: startDate?.toISOString() || pastNDays.toISOString(),
          end: endDate?.toISOString() || now.toISOString(),
          days,
        }
      },
      origins: {
        topCountries: topOriginCountries,
        champion: topOrdersOrigin,
        insights: {
          concentrationRatio: topOriginCountries.length > 0 
            ? (topOriginCountries[0]?.orders / totalOrders * 100) : 0,
          avgOrderValue: topOriginCountries.reduce((sum, c) => sum + c.avgOrderValue, 0) / Math.max(topOriginCountries.length, 1)
        }
      },
      destinations: {
        topCountries: topDestinationCountries,
        champion: topOrdersDestination,
        insights: {
          concentrationRatio: topDestinationCountries.length > 0 
            ? (topDestinationCountries[0]?.orders / totalOrders * 100) : 0,
          avgOrderValue: topDestinationCountries.reduce((sum, c) => sum + c.avgOrderValue, 0) / Math.max(topDestinationCountries.length, 1)
        }
      },
      routes: {
        topRoutes: countryPairRoutes,
        mostPopular: topRoute,
        diversity: countryPairRoutes.length,
        insights: {
          routeConcentration: topRoute && totalOrders > 0 
            ? (topRoute.orders / totalOrders * 100) : 0,
          avgRevenuePerRoute: countryPairRoutes.reduce((sum, r) => sum + r.revenue, 0) / Math.max(countryPairRoutes.length, 1)
        }
      },
      revenue: {
        byCountry: revenueByCountry,
        topPerformer: topRevenueCountry,
        distribution: revenueByCountry.map(country => ({
          ...country,
          shareOfTotal: totalRevenue > 0 ? (country.totalRevenue / totalRevenue * 100) : 0
        }))
      },
      infrastructure: {
        addressesByCountry,
        totalAddresses: addressesByCountry.reduce((sum, addr) => sum + addr.addressCount, 0),
        activeAddresses: addressesByCountry.reduce((sum, addr) => sum + addr.activeAddresses, 0)
      },
      marketAnalysis: marketPenetration,
      metadata: {
        generatedAt: new Date().toISOString(),
        generatedBy: {
          userId: user.id,
          role: user.role,
          name: user.name,
        },
        filters: {
          startDate: startDateParam,
          endDate: endDateParam,
          days,
          limit,
        },
      },
    };

    return successResponse({
      status: 200,
      message: "Country analytics fetched successfully",
      data: analytics,
      req,
    });

  } catch (err: any) {
    console.error("Country Analytics Error:", err);
    return errorResponse({
      status: 500,
      message: "Failed to fetch country analytics",
      error: err.message || err,
      req,
    });
  }
});