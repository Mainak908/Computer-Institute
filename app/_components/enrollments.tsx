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
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store";

interface Enrollment {
  admitLink: string;
  certificateLink: string;
  dob: string; // or Date if you want to parse it
  idCardLink: string;
  marksheetLink: string;
  name: string;
  createdAt: string; // or Date
  Enrollmentno: string;
  id: number;
  activated: boolean;
}

const PAGE_SIZE = 5;

const EnrollmentList = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<Enrollment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { temploading, settemploading } = useAuthStore();
  const [totalEnrollments, setTotalEnrollments] = useState(0); // Track total count

  const fetchEnrollments = async () => {
    try {
      const { enrollments, total } = await fetcherWc(
        `/AllEnrollments?page=${currentPage}&limit=${PAGE_SIZE}`,
        "GET"
      );
      setEnrollments(enrollments);
      setTotalEnrollments(total);
    } catch (error) {
      console.error("Failed to fetch enrollments:", error);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [currentPage]);

  const toggleActivation = async (enrollment: Enrollment) => {
    toast("Please wait...");
    const endpoint = enrollment.activated
      ? "/deActivateEnrollment"
      : "/ActivateEnrollment";
    const data = await fetcherWc(endpoint, "POST", { id: enrollment.id });

    if (data.ok) {
      setEnrollments((prev) =>
        prev.map((p) =>
          p.id === enrollment.id ? { ...p, activated: !p.activated } : p
        )
      );
      toast("Success");
    } else {
      toast("Failed");
    }
  };

  const generateHandler = async (Enrollmentno: string) => {
    toast("Generating ID...");
    settemploading(true);
    const data = await fetcherWc("/generateId", "POST", { Enrollmentno });
    settemploading(false);
    toast(data.ok ? "ID generated successfully" : "ID generation failed");
  };

  const filteredEnrollment = enrollments.filter((enrollment) =>
    enrollment.Enrollmentno?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-w-lg mx-auto mt-10 p-4 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center px-4 py-2">
        <h2 className="text-xl font-bold">Enrollment Verify</h2>
        <Input
          type="text"
          placeholder="Search enrollment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-1/3 p-2 border border-gray-400 rounded-lg"
        />
      </div>
      <div className="grid grid-cols-5 text-center gap-2 font-bold py-2 border-b border-gray-500">
        <span>Name</span>
        <span>Email ID</span>
        <span>Date</span>
        <span>Approval</span>
        <span>Generate</span>
      </div>
      <div>
        {filteredEnrollment.map((enrollment) => (
          <div
            key={enrollment.id}
            className="click grid grid-cols-5 items-center text-gray-600 text-center gap-2 font-bold py-3 border-b border-l border-r border-gray-500 cursor-pointer bg-gray-200 hover:bg-blue-100"
          >
            <div
              className="hover:text-violet-800"
              onClick={() => {
                setSelectedEnrollment(enrollment);
                setIsModalOpen(true);
              }}
            >
              {enrollment.name}
            </div>
            <div>{enrollment.Enrollmentno}</div>
            <span>{new Date(enrollment.createdAt).toDateString()}</span>
            <div className="flex items-center justify-center gap-2">
              <Switch
                id={`activation-${enrollment.id}`}
                checked={enrollment.activated}
                onCheckedChange={() => toggleActivation(enrollment)}
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
              />
            </div>
            <Button
              className={`mx-4 ${
                enrollment.activated
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              onClick={() => generateHandler(enrollment.Enrollmentno)}
              disabled={!enrollment.activated || temploading}
            >
              Generate ID
            </Button>
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
                  currentPage * PAGE_SIZE < totalEnrollments ? prev + 1 : prev
                )
              }
              isActive={currentPage * PAGE_SIZE < totalEnrollments}
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
              ✖
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
