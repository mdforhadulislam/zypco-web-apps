"use client";
import {
  deleteRequestSend,
  getRequestSend,
  postRequestSend,
  putRequestSend,
} from "@/components/ApiCall/methord";
import {
  NOTIFICATION_API,
  PICKUP_API,
  SINGLE_ACCOUNT_ADDRESS_API,
  SINGLE_PICKUP_API,
} from "@/components/ApiCall/url";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/AuthContext";
import { SquareChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { toast } from "sonner";

type Pickup = {
  _id: string;
  preferredDate: string;
  preferredTimeSlot: string;
  status: string;
  notes: string;

  address: {
    addressLine: string;
    area: string;
    city: string;
  };
  user: {
    name: string;
    phone: string;
  };
  cost: string;
};
const DashboardPickups = () => {
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [isViewPickup, setIsViewPickup] = useState(false);
  const [isEditPickup, setIsEditPickup] = useState(false);
  const [singleUserAddressSelected, setSingleUserAddressSelected] = useState<any[]>([])

  const [isPicked, setIsPicked] = useState(false);

  const [cost, setCost] = useState("");

  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null);

  const auth = useAuth();

  const fetchPickups = async () => {
    const res = await getRequestSend(`${PICKUP_API}?page=${page}&limit=10`);
    const data = res.data as Pickup[];
    console.log(data);
    setPickups((prev) => [...prev, ...data]);
    if (page >= res.meta.totalPages) {
      setHasMore(false);
    }
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    getRequestSend(`${PICKUP_API}?page=${page}&limit=10`).then((res) => {
      if (res.status == 200) {
        const data = res.data as Pickup[];
        setPickups(data);
      }
    });
  }, []);

  return (
    <div className="w-full h-auto">
      <div className=" flex w-full h-auto justify-between items-center align-middle border py-1 gap-2 px-1">
        <h1 className="font-semibold text-lg text-defult m-0 h-auto">PICKUP</h1>

        <div className="flex gap-1 hiddenScrollBar overflow-auto">
          <Button
            onClick={() => {}}
            className=" py-[3px] h-auto cursor-pointer"
          >
            Create Pickup
          </Button>

          <Button
            onClick={() => {}}
            className=" py-[3px] h-auto cursor-pointer"
          >
            All
          </Button>
          <Button
            onClick={() => {}}
            className="bg-yellow-500 hover:bg-yellow-500/85 py-[3px] h-auto cursor-pointer"
          >
            pending
          </Button>
          <Button
            onClick={() => {}}
            className=" bg-yellow-500 hover:bg-yellow-500/85 py-[3px] h-auto cursor-pointer"
          >
            scheduled
          </Button>
          <Button
            onClick={() => {}}
            className=" bg-green-600 hover:bg-green-600/85 py-[3px] h-auto cursor-pointer"
          >
            picked
          </Button>
          <Button
            onClick={() => {}}
            className=" bg-red-500 hover:bg-red-500/85 py-[3px] h-auto cursor-pointer"
          >
            cancelled
          </Button>
        </div>

        <Link href={"/admin/pickup"}>
          <SquareChevronRight
            size={28}
            strokeWidth={1.5}
            className=" text-defult cursor-pointer"
          />
        </Link>
      </div>
      <div>
        <InfiniteScroll
          dataLength={pickups.length}
          next={fetchPickups}
          hasMore={hasMore}
          loader={<div>lodding....</div>}
          endMessage={<div>No results.</div>}
        >
          <Table className="w-full h-auto">
            <TableHeader>
              <TableRow className="border">
                <TableHead className="border-r text-center">PROFILE</TableHead>
                <TableHead className="border-r text-center">NAME</TableHead>
                <TableHead className="border-r text-center">PHONE</TableHead>
                <TableHead className="border-r text-center">NOTE</TableHead>
                <TableHead className="border-r text-center">LOCATION</TableHead>
                <TableHead className="border-r text-center">STATUS</TableHead>
                <TableHead className=" text-center">ACTION</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className={`h-auto p-2 border`}>
              {!pickups.length
                ? ""
                : pickups?.map((pickup, index) => (
                    <TableRow key={index} className="p-2 border">
                      <TableCell className="text-center flex justify-around align-middle items-center h-full py-4">
                        <div>{index + 1}.</div>
                        <Avatar className="h-12 w-12 rounded-full">
                          <AvatarImage src={""} alt={pickup.user.name} />
                          <AvatarFallback className="rounded-full">
                            {pickup.user.name.split("")[0]}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="text-center">
                        {pickup?.user.name}
                      </TableCell>
                      <TableCell className="text-center">
                        {pickup?.user.phone}
                      </TableCell>

                      <TableCell className="text-center">
                        {pickup.notes}
                      </TableCell>

                      <TableCell className="text-center">
                        {pickup.address.addressLine}, {pickup.address.area},{" "}
                        {pickup.address.city}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          className={`${
                            pickup?.status == "picked"
                              ? "bg-green-600 hover:bg-green-600/85"
                              : pickup?.status == "scheduled"
                              ? "bg-yellow-500 hover:bg-yellow-500/85"
                              : pickup?.status == "cancelled"
                              ? "bg-red-600 hover:bg-red-600/85"
                              : pickup?.status == "pending"
                              ? "bg-[#241F21] hover:bg-[#241F21]-600/85 text-white"
                              : "bg-white shadow-[0]"
                          } transition-all duration-300`}
                        >
                          {pickup?.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex flex-col gap-2 items-center align-middle justify-center">
                          <div className="flex gap-2 flex-row items-center align-middle justify-center">
                            <Badge
                              className=" cursor-pointer"
                              onClick={() => {
                                setSelectedPickup(pickup);
                                setIsViewPickup(!isViewPickup);
                              }}
                            >
                              View
                            </Badge>
                            <Badge
                              className=" cursor-pointer"
                              onClick={() => {
                                setSelectedPickup(pickup);
                                setIsEditPickup(!isEditPickup);
                                getRequestSend(SINGLE_ACCOUNT_ADDRESS_API(pickup.user.phone)).then(res=>{
                                  if(res.status==200){
setSingleUserAddressSelected(res.data)
                                    
                                  }
                                })
                              }}
                            >
                              Edit
                            </Badge>
                          </div>

                          <div className="flex gap-2 flex-row items-center align-middle justify-center">
                            {(pickup.status != "cancelled" ||
                              auth.user?.role == "admin") && (
                              <Badge
                                className=" cursor-pointer"
                                onClick={() => {
                                  putRequestSend(
                                    SINGLE_PICKUP_API(pickup._id),
                                    {},
                                    {
                                      ...pickup,
                                      status: "scheduled",
                                      moderator: auth.user?.id,
                                    }
                                  ).then((res) => {
                                    if (res.status == 200) {
                                      toast.success(
                                        `Pickup Scheduled By ${res?.data?.moderator?.name} And ID:${res?.data?.moderator?.phone}`
                                      );
                                      postRequestSend(
                                        NOTIFICATION_API,
                                        {},
                                        {
                                          title: `Pickup Scheduled By ${res?.data?.moderator?.name} And ID:${res?.data?.moderator?.phone}`,
                                          userId: pickup._id,
                                          message: `Moderator set for pickup your parcel. Modaretor Phone Number ${res?.data?.moderator?.phone}`,
                                        }
                                      ).then((res) => {
                                        if (res.status == 200) {
                                          toast.success(`User Notify Done`);
                                        }
                                      });
                                      getRequestSend(PICKUP_API).then((res) => {
                                        if (res.status == 200) {
                                          setPickups(res.data);
                                        }
                                      });
                                    }
                                  });
                                }}
                              >
                                Set Scheduled
                              </Badge>
                            )}
                            <Badge
                              className=" cursor-pointer"
                              onClick={() => {
                                putRequestSend(
                                  SINGLE_PICKUP_API(pickup._id),
                                  {},
                                  {
                                    ...pickup,
                                    status: "cancelled",
                                    moderator: auth.user?.id,
                                    cost: 0,
                                  }
                                ).then((res) => {
                                  if (res.status == 200) {
                                    toast.success(
                                      `Pickup Cancelled By ${res?.data?.moderator?.name} And ID:${res?.data?.moderator?.phone}`
                                    );
                                    postRequestSend(
                                      NOTIFICATION_API,
                                      {},
                                      {
                                        title: `Pickup Cancelled By ${res?.data?.moderator?.name} And ID:${res?.data?.moderator?.phone}`,
                                        userId: pickup._id,
                                        message: `Moderator Cancelled your Pickup request.`,
                                      }
                                    ).then((res) => {
                                      if (res.status == 200) {
                                        toast.success(`User Notify Done`);
                                      }
                                    });
                                    getRequestSend(PICKUP_API).then((res) => {
                                      if (res.status == 200) {
                                        setPickups(res.data);
                                      }
                                    });
                                  }
                                });
                              }}
                            >
                              Cancelled
                            </Badge>
                            {auth.user?.role == "admin" && (
                              <Badge
                                className=" cursor-pointer"
                                onClick={() => {
                                  deleteRequestSend(
                                    SINGLE_PICKUP_API(pickup._id)
                                  ).then((res) => {
                                    if (res.status == 200) {
                                      toast.success(
                                        `${index + 1} Number Pickup deleted`
                                      );
                                      postRequestSend(
                                        NOTIFICATION_API,
                                        {},
                                        {
                                          title: `Pickup Delete By ${res?.data?.moderator?.name} And ID:${res?.data?.moderator?.phone}`,
                                          userId: pickup._id,
                                          message: `Admin delete your pickup request.`,
                                        }
                                      ).then((res) => {
                                        if (res.status == 200) {
                                          toast.success(`User Notify Done`);
                                        }
                                      });
                                      getRequestSend(PICKUP_API).then((res) => {
                                        if (res.status == 200) {
                                          setPickups(res.data);
                                        }
                                      });
                                    }
                                  });
                                }}
                              >
                                Delete
                              </Badge>
                            )}

                            {!pickup?.cost && (
                              <Badge
                                className=" cursor-pointer"
                                onClick={() => {
                                  putRequestSend(
                                    SINGLE_PICKUP_API(pickup._id),
                                    {},
                                    {
                                      ...pickup,
                                      status: "picked",
                                      moderator: auth.user?.id,
                                    }
                                  ).then((res) => {
                                    if (res.status == 200) {
                                      toast.success(
                                        `Pickup Picked By ${res?.data?.moderator?.name} And ID:${res?.data?.moderator?.phone}`
                                      );
                                      setSelectedPickup(pickup);
                                      setIsPicked(true);
                                    }
                                  });
                                }}
                              >
                                Picked
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </InfiniteScroll>
      </div>

      <AlertDialog open={isViewPickup} onOpenChange={setIsViewPickup}>
        <AlertDialogContent className="bg-transparent bg-none border-none p-2 py-1">
          <div className="bg-white p-4 border border-white rounded-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-semibold text-defult">
                Pickup Request Details
              </AlertDialogTitle>
            </AlertDialogHeader>

            <div className="overflow-x-auto py-2 pt-1">
              <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2">Field</th>
                    <th className="border border-gray-300 px-4 py-2">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-semibold">
                      Name
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {selectedPickup?.user.name}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-semibold">
                      Phone
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {selectedPickup?.user.phone}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-semibold">
                      Time
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(selectedPickup?.preferredDate).getDate()} {"-"}{" "}
                      {new Date(selectedPickup?.preferredDate).getMonth()} {"-"}{" "}
                      {new Date(selectedPickup?.preferredDate).getFullYear()}{" "}
                      {" - "}
                      {new Date(
                        selectedPickup?.preferredDate
                      ).toLocaleTimeString()}
                    </td>
                  </tr>

                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-semibold">
                      Address
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {selectedPickup?.address.addressLine}{" "}
                      {selectedPickup?.address.area},{" "}
                      {selectedPickup?.address.city},{" "}
                      {selectedPickup?.address.country.name}
                    </td>
                  </tr>

                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-semibold">
                      Status
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {selectedPickup?.status}
                    </td>
                  </tr>

                  {(selectedPickup?.status == "scheduled" ||
                    selectedPickup?.status == "cancelled" ||
                    selectedPickup?.status == "picked") && (
                    <>
                      {" "}
                      <h1 className="text-base font-semibold text-defult capitalize">
                        {selectedPickup.status} By
                      </h1>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-semibold">
                          Moderator
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {selectedPickup?.moderator.name}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-semibold">
                          Moderator Phone
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {selectedPickup?.moderator.phone}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-semibold">
                          Cost
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {selectedPickup?.cost}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            <AlertDialogFooter>
              <AlertDialogAction className=" bg-black hover:bg-black/90 cursor-pointer">
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isPicked} onOpenChange={setIsPicked}>
        <AlertDialogContent className="bg-transparent bg-none border-none p-1">
          <div className="bg-white p-3 border border-white rounded-lg flex-col flex gap-2">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-semibold text-defult">
                Set Pickup Cost
              </AlertDialogTitle>
            </AlertDialogHeader>

            <Label htmlFor="cost">Enter Cost Amount:</Label>
            <Input
              className=""
              id="cost"
              value={cost}
              onChange={(e) => {
                setCost(e.target.value);
              }}
            />

            <AlertDialogFooter>
              <Button
                className=" bg-black hover:bg-black/90 cursor-pointer"
                onClick={() => {
                  putRequestSend(
                    SINGLE_PICKUP_API(selectedPickup._id),
                    {},
                    {
                      ...selectedPickup,

                      status: "picked",
                      moderator: auth.user?.id,

                      cost,
                    }
                  ).then((res) => {
                    if (res.status == 200) {
                      toast.success(
                        `Pickup Cost Set By ${res?.data?.moderator?.name} And ID:${res?.data?.moderator?.phone}`
                      );
                      getRequestSend(PICKUP_API).then((res) => {
                        if (res.status == 200) {
                          setPickups(res.data);

                          setIsPicked(false);
                        }
                      });
                    }
                  });
                }}
              >
                Continue
              </Button>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isEditPickup} onOpenChange={setIsEditPickup}>
        <AlertDialogContent className="bg-transparent bg-none border-none p-1">
          <div className="bg-white p-3 border border-white rounded-lg flex-col flex gap-2">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-semibold text-defult">
                Edit Pickup Request
              </AlertDialogTitle>
            </AlertDialogHeader>
            <form className="space-y-1">
 <div>
               <h3 className="text-sm font-medium">Selected Address</h3>
      

      <RadioGroup defaultValue={selectedPickup?.address._id} className="grid gap-2 md:grid-cols-2">
       
      {
      singleUserAddressSelected.map((item,index)=><Label htmlFor={item._id} className="cursor-pointer" key={index}>
          <Card
            className="relative cursor-pointer hover:shadow-md transition py-2 gap-1"
          >
            <CardHeader className="flex items-center justify-between space-y-0 p-2 pb-0 ">
              <div className="flex items-center gap-1">
                <RadioGroupItem id={item._id} value={item._id} />
                <CardTitle className="text-base font-semibold">
                  {item.label} {" - "} {item.name} {" - "} {item.phone}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
              <p> {item.name}  </p>
                 <p>
                 
                 {item.phone}</p>
                 <p>
                 
                 {item?.addressLine}{item?.addressLine && ", "}{item?.area}{item?.area && ", "}{item?.subCity}{item?.subCity  &&", "}{item?.city }{item?.city  && ", "}{item?.state }{item?.state  && ", "}{item?.zipCode }
                 
                 </p>
              </p>
            </CardContent>
          </Card>
        </Label>)
      }

        
        
      </RadioGroup>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="pickupTime"
                >
                  Pickup Time
                </label>

                <Input
                  type="datetime-local"
                  id="pickupTime"
                  name="pickupTime"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="parcelWeight"
                >
                  Notes
                </label>
                <Input
                  type="text"
                  id="parcelWeight"
                  name="parcelWeight"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="staffCost"
                >
                  Staff Cost
                </label>
                <Input
                  type="text"
                  id="staffCost"
                  name="staffCost"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </form>

            <AlertDialogFooter>
              <Button
                className=" bg-black hover:bg-black/90 cursor-pointer"
                onClick={() => {}}
              >
                Continue
              </Button>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardPickups;
