"use client";
import { getRequestSend } from "@/components/ApiCall/methord";
import { PICKUP_API } from "@/components/ApiCall/url";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ellipsis } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import InfiniteScroll from "react-infinite-scroll-component";

type Pickup = {
  _id: string;
  preferredDate: string;
  preferredTimeSlot: string;
  status: string;
  notes: string;
  pickupAddress: {
    addressLine: string;
    area: string;
    city: string;
  };
  user: {
    name: string;
    phone: string;
  };
};
const DashboardPickups = () => {
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPickups = async () => {
    const res = await getRequestSend(`${PICKUP_API}?page=${page}&limit=10`);
    const data = res.data;
    setPickups((prev) => [...prev, ...data]);

    if (page >= res.meta.totalPages) {
      setHasMore(false);
    }
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  return (
    <div className="">
      <div>
 <InfiniteScroll
          dataLength={pickups.length}
          next={fetchPickups}
          hasMore={hasMore}
          loader={<h4>Loading...</h4>}
          endMessage={<p>No more pickups</p>}
        > 
        <Table className="w-full h-auto">
        <TableHeader>
          <TableRow className="border-b">
            <TableHead className="border-r text-center">PROFILE</TableHead>
            <TableHead className="border-r text-center">NAME</TableHead>
            <TableHead className="border-r text-center">PHONE</TableHead> 
            <TableHead className="border-r text-center">LOCATION</TableHead>
            <TableHead className="border-r text-center">STATUS</TableHead>
            <TableHead className=" text-center">ACTION</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className={`h-auto p-2 border-b`}>
            
          

          {!pickups.length ? (
            <TableRow>
              <TableCell colSpan={7} className="h-[500px] text-center">
                No results.
              </TableCell>
            </TableRow>
          ) : (
           pickups?.map((pickup, index) => (
              <TableRow key={index} className="p-2 border">
                <TableCell className="text-center flex justify-around align-middle items-center h-full py-4">
                  <div>{index + 1}.</div>
                 <Avatar className="h-8 w-8 rounded-lg">
                                       <AvatarImage src={""} alt={pickup.user.name} />
                                       <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                     </Avatar>

                </TableCell>
                <TableCell className="text-center">{pickup?.user.name}</TableCell>
                <TableCell className="text-center">{pickup?.user.phone}</TableCell>
               
                <TableCell className="text-center">
                  {pickup.pickupAddress.addressLine}, {pickup.pickupAddress.area},{" "}
                {pickup.pickupAddress.city}
                </TableCell>

                <TableCell className="text-center">
                  <Badge
                    className={`${
                      pickup?.status == "Done"
                        ? "bg-green-600 hover:bg-green-600/85"
                        : pickup?.status == "Pending"
                        ? "bg-yellow-500 hover:bg-yellow-500/85"
                        : pickup?.status == "Cencel"
                        ? "bg-red-600 hover:bg-red-600/85"
                        : pickup?.status == "Created"
                        ? "bg-defult hover:bg-defult-600/85"
                        : "bg-white shadow-[0]"
                    } transition-all duration-300`}
                  >
                    {pickup?.status}
                  </Badge>
                </TableCell>

                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 outline-none"
                      >
                        <span className="sr-only">Open menu</span>
                        <Ellipsis size={28} width={28} height={28} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className=" cursor-pointer px-6 pl-2"
                        onClick={() => {
                      
                        }}
                      >
                        View Pickup
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className=" cursor-pointer px-6 pl-2"
                        onClick={() => {
                    
                        }}
                      >
                        Edit Pickup
                      </DropdownMenuItem>

                      {pickup.status == "Created" && (
                        <DropdownMenuItem
                          className=" cursor-pointer px-6 pl-2"
                          onClick={() => {
                          
                          }}
                        >
                          Accept Pickup
                        </DropdownMenuItem>
                      )}

                      {pickup.status == "Pending" && (
                        <DropdownMenuItem
                          className=" cursor-pointer px-6 pl-2"
                          onClick={() => {
                         
                          }}
                        >
                          Done Pickup
                        </DropdownMenuItem>
                      )}

                      {!(
                        pickup.status == "Cencel" ||
                        pickup.status == "Done"
                      ) && (
                        <DropdownMenuItem
                          className=" cursor-pointer px-6 pl-2"
                          onClick={() => {
                       
                          }}
                        >
                          Cencel Pickup
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem
                        className=" cursor-pointer px-6 pl-2"
                        onClick={() => {
                       
                        }}
                      >
                        Delete Pickup
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
          
       
        </TableBody>
        
      </Table>

           </InfiniteScroll>

     
         
      </div>
    </div>
  );
};

export default DashboardPickups;
