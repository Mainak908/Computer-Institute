"use client";

import { useEffect, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { fetcherWc } from "@/helper";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import Enroll from "@/app/_components/studentEntry";

export interface Enrollment {
  name: string;
  Enrollmentno: string;
  activated: boolean;
  id: number;
  createdAt: string;
}

const PAGE_SIZE = 5;

const EnrollmentList = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<Enrollment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(true);

  const fetchfn = async () => {
    const data = await fetcherWc("/AllEnrollments", "GET");
    console.log(data);
    setEnrollments(data);
  };
  console.log(enrollments);
  useEffect(() => {
    fetchfn();
  }, []);

  const toggleActivation = async ({ activated, id }: Enrollment) => {
    toast("plz wait");
    console.log(id);
    if (activated) {
      const data = await fetcherWc("/deActivateEnrollment", "POST", { id });
      console.log(data);
      if (data.ok) {
        setEnrollments((prev) =>
          prev.map((p) => (p.id === id ? { ...p, activated: false } : p))
        );
      }
      toast(data.ok ? "success" : "failed");
      return;
    }

    const data = await fetcherWc("/ActivateEnrollment", "POST", { id });
    console.log(data);
    if (data.ok) {
      setEnrollments((prev) =>
        prev.map((p) => (p.id === id ? { ...p, activated: true } : p))
      );
    }
    toast(data.ok ? "success" : "failed");
  };

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentEnrollments = enrollments.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  return (
    <div className="min-w-lg mx-auto mt-10 p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl text-center font-bold mb-6">Enrollment List</h2>
      <div className="grid grid-cols-4 text-center gap-2 font-bold py-2 border-b border-gray-500">
        <span>Name</span>
        <span>Enrollment No</span>
        <span>Date</span>
        <span>Approval</span>
      </div>
      <div>
        {currentEnrollments.map((enrollment, index: number) => (
          <div
            key={index}
            className={`click grid grid-cols-4 items-center text-gray-600 text-center gap-2 font-bold py-3 border-b border-l border-r border-gray-500 cursor-pointer ${
              isNew ? "bg-rose-100" : "bg-gray-200"
            } hover:bg-blue-100`}
          >
            <div
              className="hover:text-violet-800"
              onClick={() => {
                setSelectedEnrollment(enrollment);
                setIsModalOpen(true);
                setIsNew(false);
              }}
            >
              {isNew && (
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              )}
              {enrollment.name}
            </div>
            <div>{enrollment.Enrollmentno}</div>
            <span>{new Date(enrollment.createdAt).toDateString()}</span>
            <div className="flex items-center justify-center gap-2">
              <Switch
                id={`activation-${startIndex + index}`}
                checked={enrollment.activated}
                onCheckedChange={() => toggleActivation(enrollment)}
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              isActive={currentPage !== 1}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                setCurrentPage((prev) =>
                  startIndex + PAGE_SIZE < enrollments.length ? prev + 1 : prev
                )
              }
              isActive={startIndex + PAGE_SIZE < enrollments.length}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* Fullscreen Modal */}
      {isModalOpen && selectedEnrollment && (
        <div className="fixed inset-0 p-6 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl h-full overflow-auto">
            <button
              className="absolute top-4 right-4 p-2 bg-gray-200 rounded-full hover:bg-gray-300"
              onClick={() => setIsModalOpen(false)}
            >
              <X size={24} className="hover:text-red-600" />
            </button>
            <EnrollmentDetails enrollment={selectedEnrollment} />
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentList;

const EnrollmentDetails = ({ enrollment }: { enrollment: Enrollment }) => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        Enrollment Details
      </h2>
      <div className="grid grid-cols-2 gap-4 text-gray-700">
        {Object.entries(enrollment).map(([key, value]) => (
          <div key={key} className="p-3 border-b border-gray-300">
            <span className="font-semibold capitalize text-gray-600">
              {key.replace(/([A-Z])/g, " $1").trim()}:
            </span>
            <span className="block text-gray-900">
              {key === "createdAt" || key === "dob"
                ? new Date(value).toDateString()
                : value || "-"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
