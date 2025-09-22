"use client";
import { getRequestSend } from "@/components/ApiCall/methord";
import { PICKUP_API } from "@/components/ApiCall/url";
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
          {pickups.map((pickup) => (
            <div key={pickup._id} className="border p-3 my-2 rounded">
              <h3>{pickup.user.name}</h3>
              <p>
                {pickup.pickupAddress.addressLine}, {pickup.pickupAddress.area},{" "}
                {pickup.pickupAddress.city}
              </p>
              <p>Date: {new Date(pickup.preferredDate).toLocaleDateString()}</p>
              <p>Time: {pickup.preferredTimeSlot}</p>
              <p>Status: {pickup.status}</p>
              <p>Notes: {pickup.notes}</p>
            </div>
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default DashboardPickups;
