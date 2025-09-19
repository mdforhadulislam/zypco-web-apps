"use client";

import { postRequestSend } from "@/components/ApiCall/methord";
import { ROOT_API } from "@/components/ApiCall/url";
import PageHeader from "@/utilities/PageHeader";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Package,
  Shield,
  Truck,
  User,
} from "lucide-react";
import { useState } from "react";

interface OrderFormData {
  parcel: {
    sender: {
      name: string;
      phone: string;
      email: string;
      address: {
        address: string;
        city: string;
        zipCode: string;
        country: string;
      };
    };
    receiver: {
      name: string;
      phone: string;
      email: string;
      address: {
        address: string;
        city: string;
        zipCode: string;
        country: string;
      };
    };
    weight: string;
    serviceType: string;
    priority: "normal" | "express" | "super-express";
    orderType: "document" | "parcel" | "e-commerce";
    item: Array<{
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
    customerNote: string;
  };
  payment?: {
    pType: string;
    pAmount: number;
    pOfferDiscount: number;
    pExtraCharge: number;
    pDiscount: number;
    pReceived: number;
    pRefunded: number;
  };
}

interface ApiResponse {
  _id: string;
  trackId: string;
  orderDate: string;
  createdAt: string;
  updatedAt: string;
}

const CreateShipment = () => {
  const [formData, setFormData] = useState<OrderFormData>({
    parcel: {
      sender: {
        name: "",
        phone: "",
        email: "",
        address: {
          address: "",
          city: "",
          zipCode: "",
          country: "",
        },
      },
      receiver: {
        name: "",
        phone: "",
        email: "",
        address: {
          address: "",
          city: "",
          zipCode: "",
          country: "",
        },
      },
      weight: "",
      serviceType: "standard",
      priority: "normal",
      orderType: "parcel",
      item: [
        {
          name: "",
          quantity: 1,
          unitPrice: 0,
          totalPrice: 0,
        },
      ],
      customerNote: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<ApiResponse | null>(null);
  const [error, setError] = useState("");

  const serviceTypes = [
    {
      value: "express",
      label: "Express Delivery",
      time: "1-3 days",
      icon: "⚡",
      priority: "super-express" as const,
    },
    {
      value: "standard",
      label: "Standard Delivery",
      time: "3-5 days",
      icon: "📦",
      priority: "express" as const,
    },
    {
      value: "economy",
      label: "Economy Delivery",
      time: "5-7 days",
      icon: "🚛",
      priority: "normal" as const,
    },
  ];

  const packageTypes = [
    {
      value: "document",
      label: "Document",
      description: "Letters, papers, certificates",
      maxWeight: "0.5 kg",
    },
    {
      value: "parcel",
      label: "Parcel",
      description: "General packages and goods",
      maxWeight: "30 kg",
    },
    {
      value: "e-commerce",
      label: "E-commerce",
      description: "Online store items",
      maxWeight: "No limit",
    },
  ];

  const updateFormField = (
    section: "sender" | "receiver",
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      parcel: {
        ...prev.parcel,
        [section]: {
          ...prev.parcel[section],
          [field]: value,
        },
      },
    }));
  };

  const updateAddressField = (
    section: "sender" | "receiver",
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      parcel: {
        ...prev.parcel,
        [section]: {
          ...prev.parcel[section],
          address: {
            ...prev.parcel[section].address,
            [field]: value,
          },
        },
      },
    }));
  };

  const updateParcelField = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      parcel: {
        ...prev.parcel,
        [field]: value,
      },
    }));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    setFormData((prev) => {
      const newItems = [...prev.parcel.item];
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      };

      // Auto-calculate totalPrice
      if (field === "quantity" || field === "unitPrice") {
        newItems[index].totalPrice =
          newItems[index].quantity * newItems[index].unitPrice;
      }

      return {
        ...prev,
        parcel: {
          ...prev.parcel,
          item: newItems,
        },
      };
    });
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      parcel: {
        ...prev.parcel,
        item: [
          ...prev.parcel.item,
          {
            name: "",
            quantity: 1,
            unitPrice: 0,
            totalPrice: 0,
          },
        ],
      },
    }));
  };

  const removeItem = (index: number) => {
    if (formData.parcel.item.length > 1) {
      setFormData((prev) => ({
        ...prev,
        parcel: {
          ...prev.parcel,
          item: prev.parcel.item.filter((_, i) => i !== index),
        },
      }));
    }
  };

  const validateForm = (): string | null => {
    const { parcel } = formData;

    if (!parcel.sender.name.trim()) return "Sender name is required";
    if (!parcel.sender.phone.trim()) return "Sender phone is required";
    if (!parcel.sender.email.trim()) return "Sender email is required";
    if (!parcel.sender.address.address.trim())
      return "Sender address is required";

    if (!parcel.receiver.name.trim()) return "Receiver name is required";
    if (!parcel.receiver.phone.trim()) return "Receiver phone is required";
    if (!parcel.receiver.address.address.trim())
      return "Receiver address is required";
    if (!parcel.receiver.address.country.trim())
      return "Destination country is required";

    if (!parcel.weight.trim()) return "Package weight is required";

    for (let i = 0; i < parcel.item.length; i++) {
      const item = parcel.item[i];
      if (!item.name.trim()) return `Item ${i + 1} name is required`;
      if (item.quantity <= 0)
        return `Item ${i + 1} quantity must be greater than 0`;
      if (item.unitPrice < 0)
        return `Item ${i + 1} unit price cannot be negative`;
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await postRequestSend<OrderFormData, ApiResponse>(
        `${ROOT_API}orders`,
        {},
        formData
      );

      if (response.status === 201 && response.data) {
        setSuccess(response.data);
        setError("");
        // Reset form
        setFormData({
          parcel: {
            sender: {
              name: "",
              phone: "",
              email: "",
              address: { address: "", city: "", zipCode: "", country: "" },
            },
            receiver: {
              name: "",
              phone: "",
              email: "",
              address: { address: "", city: "", zipCode: "", country: "" },
            },
            weight: "",
            serviceType: "standard",
            priority: "normal",
            orderType: "parcel",
            item: [{ name: "", quantity: 1, unitPrice: 0, totalPrice: 0 }],
            customerNote: "",
          },
        });
      } else {
        setError(response.message || "Failed to create shipment");
      }
    } catch (err) {
      setError("Failed to create shipment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Truck className="w-6 h-6 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Doorstep Pickup",
      description: "Free pickup from your location",
    },
    {
      icon: <Shield className="w-6 h-6 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Insurance Coverage",
      description: "Full protection up to declared value",
    },
    {
      icon: <Clock className="w-6 h-6 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Real-time Tracking",
      description: "Monitor your shipment 24/7",
    },
    {
      icon: <Package className="w-6 h-6 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Professional Packaging",
      description: "Expert handling and packaging service",
    },
  ];

  const steps = [
    "Fill in shipment details",
    "Choose delivery service",
    "Schedule pickup time",
    "Make payment",
    "Track your shipment",
  ];

  if (success) {
    return (
      <div className="w-full h-auto bg-[#241F21]">
        <PageHeader
          title="SHIP AND TRACK"
          subtitle="CREATE SHIPMENT"
          mainLink="/ship-and-track"
          subLink="/ship-and-track/create-shipment"
        />

        <div className="w-full bg-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-green-700 mb-4">
                  Shipment Created Successfully!
                </h2>
                <p className="text-green-600 mb-6">
                  Your package has been registered and is ready for pickup.
                </p>

                <div className="bg-white rounded-lg p-6 border border-green-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Shipment Details
                  </h3>
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between">
                      <span className="font-medium">Tracking ID:</span>
                      <span className="font-bold text-[#241F21]">
                        {success.trackId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Order ID:</span>
                      <span>{success._id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Created:</span>
                      <span>
                        {new Date(success.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() =>
                    (window.location.href = `/ship-and-track/track-shipment`)
                  }
                  className="bg-[#FEF400] text-[#241F21] px-8 py-3 rounded-lg hover:bg-yellow-500 transition-colors font-bold"
                >
                  Track Your Shipment
                </button>
                <button
                  onClick={() => setSuccess(null)}
                  className="border-2 border-[#241F21] text-[#241F21] px-8 py-3 rounded-lg hover:bg-[#241F21] hover:text-white transition-colors font-bold"
                >
                  Create Another Shipment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-auto bg-[#241F21]">
      <PageHeader
        title="SHIP AND TRACK"
        subtitle="CREATE SHIPMENT"
        mainLink="/ship-and-track"
        subLink="/ship-and-track/create-shipment"
      />

      {/* Hero Section */}
      <div className="w-full bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#241F21] mb-6">
              Create Your Shipment
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Send your package anywhere in the world with our reliable shipping
              service. Fill in the details below and we{"'"}ll handle the rest
              with doorstep pickup.
            </p>
          </div>

          {/* Shipment Form */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200">
              {/* Form Header */}
              <div className="bg-[#241F21] text-white p-6 rounded-t-lg">
                <div className="flex items-center">
                  <Package
                    className="w-8 h-8 text-[#FEF400] mr-3"
                    strokeWidth={1.5}
                  />
                  <h3 className="text-2xl font-bold">Shipment Details</h3>
                </div>
              </div>

              <div className="p-8">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                      <p className="text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {/* Sender Information */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <User
                      className="w-6 h-6 text-[#FEF400] mr-2"
                      strokeWidth={1.5}
                    />
                    <h4 className="text-xl font-semibold text-[#241F21]">
                      Sender Information
                    </h4>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.parcel.sender.name}
                        onChange={(e) =>
                          updateFormField("sender", "name", e.target.value)
                        }
                        placeholder="Enter sender's name"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.parcel.sender.phone}
                        onChange={(e) =>
                          updateFormField("sender", "phone", e.target.value)
                        }
                        placeholder="+880 1XXX XXXXXX"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.parcel.sender.email}
                        onChange={(e) =>
                          updateFormField("sender", "email", e.target.value)
                        }
                        placeholder="sender@example.com"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.parcel.sender.address.city}
                        onChange={(e) =>
                          updateAddressField("sender", "city", e.target.value)
                        }
                        placeholder="City name"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pickup Address *
                      </label>
                      <textarea
                        rows={3}
                        value={formData.parcel.sender.address.address}
                        onChange={(e) =>
                          updateAddressField(
                            "sender",
                            "address",
                            e.target.value
                          )
                        }
                        placeholder="Enter complete pickup address with area, city, and postal code"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Recipient Information */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <MapPin
                      className="w-6 h-6 text-[#FEF400] mr-2"
                      strokeWidth={1.5}
                    />
                    <h4 className="text-xl font-semibold text-[#241F21]">
                      Recipient Information
                    </h4>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.parcel.receiver.name}
                        onChange={(e) =>
                          updateFormField("receiver", "name", e.target.value)
                        }
                        placeholder="Enter recipient's name"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.parcel.receiver.phone}
                        onChange={(e) =>
                          updateFormField("receiver", "phone", e.target.value)
                        }
                        placeholder="Recipient's phone number"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.parcel.receiver.email}
                        onChange={(e) =>
                          updateFormField("receiver", "email", e.target.value)
                        }
                        placeholder="recipient@example.com"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.parcel.receiver.address.city}
                        onChange={(e) =>
                          updateAddressField("receiver", "city", e.target.value)
                        }
                        placeholder="City name"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country *
                      </label>
                      <select
                        value={formData.parcel.receiver.address.country}
                        onChange={(e) =>
                          updateAddressField(
                            "receiver",
                            "country",
                            e.target.value
                          )
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      >
                        <option value="">Select destination country</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="India">India</option>
                        <option value="Singapore">Singapore</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={formData.parcel.receiver.address.zipCode}
                        onChange={(e) =>
                          updateAddressField(
                            "receiver",
                            "zipCode",
                            e.target.value
                          )
                        }
                        placeholder="Postal/ZIP code"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Address *
                      </label>
                      <textarea
                        rows={3}
                        value={formData.parcel.receiver.address.address}
                        onChange={(e) =>
                          updateAddressField(
                            "receiver",
                            "address",
                            e.target.value
                          )
                        }
                        placeholder="Enter complete delivery address"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Package Information */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <Package
                      className="w-6 h-6 text-[#FEF400] mr-2"
                      strokeWidth={1.5}
                    />
                    <h4 className="text-xl font-semibold text-[#241F21]">
                      Package Information
                    </h4>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    {packageTypes.map((type) => (
                      <div
                        key={type.value}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          formData.parcel.orderType === type.value
                            ? "border-[#FEF400] bg-yellow-50"
                            : "border-gray-300 hover:border-[#FEF400] hover:bg-yellow-50"
                        }`}
                        onClick={() =>
                          updateParcelField("orderType", type.value)
                        }
                      >
                        <div className="flex items-center mb-2">
                          <input
                            type="radio"
                            name="packageType"
                            value={type.value}
                            checked={formData.parcel.orderType === type.value}
                            onChange={() =>
                              updateParcelField("orderType", type.value)
                            }
                            className="mr-3"
                          />
                          <h5 className="font-semibold text-[#241F21]">
                            {type.label}
                          </h5>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {type.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          Max: {type.maxWeight}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (kg) *
                      </label>
                      <input
                        type="text"
                        value={formData.parcel.weight}
                        onChange={(e) =>
                          updateParcelField("weight", e.target.value)
                        }
                        placeholder="0.0"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Instructions
                      </label>
                      <input
                        type="text"
                        value={formData.parcel.customerNote}
                        onChange={(e) =>
                          updateParcelField("customerNote", e.target.value)
                        }
                        placeholder="Any special instructions"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h5 className="text-lg font-semibold text-[#241F21] mb-4">
                      Package Contents
                    </h5>
                    {formData.parcel.item.map((item, index) => (
                      <div
                        key={index}
                        className="grid md:grid-cols-5 gap-4 mb-4 p-4 border border-gray-200 rounded-lg"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Item Name *
                          </label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) =>
                              updateItem(index, "name", e.target.value)
                            }
                            placeholder="Item name"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantity *
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 0
                              )
                            }
                            min="1"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Unit Price (৳)
                          </label>
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "unitPrice",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            min="0"
                            step="0.01"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Total Price (৳)
                          </label>
                          <input
                            type="number"
                            value={item.totalPrice}
                            readOnly
                            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
                          />
                        </div>
                        <div className="flex items-end">
                          {formData.parcel.item.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-800 p-2"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addItem}
                      className="text-[#FEF400] hover:text-yellow-600 font-medium"
                    >
                      + Add Another Item
                    </button>
                  </div>
                </div>

                {/* Service Selection */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <Clock
                      className="w-6 h-6 text-[#FEF400] mr-2"
                      strokeWidth={1.5}
                    />
                    <h4 className="text-xl font-semibold text-[#241F21]">
                      Service Type
                    </h4>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {serviceTypes.map((service) => (
                      <div
                        key={service.value}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          formData.parcel.serviceType === service.value
                            ? "border-[#FEF400] bg-yellow-50"
                            : "border-gray-300 hover:border-[#FEF400] hover:bg-yellow-50"
                        }`}
                        onClick={() => {
                          updateParcelField("serviceType", service.value);
                          updateParcelField("priority", service.priority);
                        }}
                      >
                        <div className="flex items-center mb-2">
                          <input
                            type="radio"
                            name="serviceType"
                            value={service.value}
                            checked={
                              formData.parcel.serviceType === service.value
                            }
                            onChange={() => {
                              updateParcelField("serviceType", service.value);
                              updateParcelField("priority", service.priority);
                            }}
                            className="mr-3"
                          />
                          <span className="text-2xl mr-2">{service.icon}</span>
                          <h5 className="font-semibold text-[#241F21]">
                            {service.label}
                          </h5>
                        </div>
                        <p className="text-sm text-gray-600">
                          Delivery: {service.time}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Create Shipment Button */}
                <div className="text-center">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-[#FEF400] text-[#241F21] py-4 px-12 rounded-lg hover:bg-yellow-500 transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating Shipment..." : "Create Shipment"}
                  </button>
                  <p className="text-sm text-gray-500 mt-3">
                    You{"'"}ll receive a tracking number after creating the
                    shipment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full bg-[#241F21]">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why Ship with Zypco?
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Experience hassle-free shipping with our comprehensive service
              features
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-[#2A2529] rounded-lg p-6 text-center hover:bg-[#323035] transition-colors"
              >
                <div className="bg-[#241F21] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-300 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process Steps */}
      <div className="w-full bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#241F21] mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple 5-step process to get your package delivered anywhere in
              the world
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-5 gap-6">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="bg-[#FEF400] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-[#241F21]">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full bg-gray-50">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-[#241F21] mb-4">
            Need Help Creating Your Shipment?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Our customer support team is available 24/7 to assist you with any
            questions or help you create your shipment.
          </p>
          <div className="flex justify-center gap-3 items-center align-middle flex-col sm:flex-row">
            <button className="bg-[#241F21] text-white py-3 px-8 rounded-lg hover:bg-gray-800 transition-colors font-semibold border-2 border-[#241F21]">
              Contact Support
            </button>
            <button className="border-2 border-[#241F21] text-[#241F21] py-3 px-8 rounded-lg hover:bg-[#241F21] hover:text-white transition-colors font-semibold">
              Calculate Rates First
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateShipment;
