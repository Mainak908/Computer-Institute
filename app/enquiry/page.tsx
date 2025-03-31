"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ComboboxDemo } from "@/components/combo";
import { Loader2, X } from "lucide-react";
import anime from "animejs";
import { Dropzone } from "@/components/dropzone";
import { fetcher } from "@/helper";
import { toast } from "react-toastify";
import {
  CategoryValue,
  enqinp1,
  enqinp2,
  frameworksEdu,
  IdCardType,
  indianStatesWithDistricts,
  Nationality,
  sexValue,
} from "@/data";

const bathroomOptions = ["Yes", "No"];

const initialFormData = {
  name: "",
  father: "",
  coName: "",
  email: "",
  dob: "",
  sex: "",
  category: "",
  nationality: "",
  mobileNo: "",
  AddressLine: "",
  vill: "",
  po: "",
  ps: "",
  pin: "",
  state: "",
  dist: "",
  eduqualification: "",
  idProof: "",
  idProofNo: "",
  houseRoomNo: "",
  squareFit: "",
  tradeLicense: "",
  bathroom: "",
};

const FranchiseForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [images, setImages] = useState<
    { category: "profile" | "signature"; src: string; file: File }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeleteImage = (category: "profile" | "signature") => {
    setImages((prev) => prev.filter((image) => image.category !== category));
  };

  const onDrop = (acceptedFile: File, category: "profile" | "signature") => {
    const reader = new FileReader();
    reader.onload = () => {
      setImages((prev) => [
        ...prev.filter((image) => image.category !== category),
        { category, src: reader.result as string, file: acceptedFile },
      ]);
      anime({
        targets: ".gallery-item",
        opacity: [0, 1],
        translateY: [50, 0],
        easing: "easeOutElastic(1, .8)",
        duration: 1000,
      });
    };
    reader.readAsDataURL(acceptedFile);
  };

  const filterDistricts = () => {
    const stateData = indianStatesWithDistricts.find(
      (val) => val.label === formData.state
    );
    return stateData
      ? stateData.districts.map((district) => ({
          value: district,
          label: district,
        }))
      : [];
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!images.length) return;
    setLoading(true);

    try {
      const uploadPromises = images.map(async (image) => {
        const { url } = await fetcher(
          `/generate-presigned-url?fileName=${image.file.name}&fileType=${image.file.type}&category=enquiry`,
          "GET"
        );
        if (!url) throw new Error("Failed to generate URL");
        const uploadResponse = await fetch(url, {
          method: "PUT",
          body: image.file,
          headers: { "Content-Type": image.file.type },
        });
        if (!uploadResponse.ok) throw new Error("Upload failed");
        return url.split("?")[0];
      });

      const Links = await Promise.all(uploadPromises);
      const { success } = await fetcher("/TakeEnquiry", "POST", {
        ...formData,
        Link: Links.join(","),
      });
      if (success) toast("Success");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto my-10 p-6 bg-white shadow-2xl rounded-2xl"
    >
      <h1 className="text-3xl font-bold text-center mb-4">
        Franchise Application Form
      </h1>
      <form onSubmit={submitHandler} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {enqinp1.map(({ label, field, type }) => (
            <div key={field}>
              <label className="block text-gray-700 mb-1">{label}</label>
              <Input
                type={type || "text"}
                value={formData[field as keyof typeof initialFormData]}
                onChange={(e) => handleChange(field, e.target.value)}
                className="w-full border rounded-md p-2"
              />
            </div>
          ))}

          {[
            { label: "State", data: indianStatesWithDistricts, field: "state" },
            { label: "District", data: filterDistricts(), field: "dist" },
            { label: "Nationality", data: Nationality, field: "nationality" },
            { label: "Gender", data: sexValue, field: "sex" },
            { label: "Category", data: CategoryValue, field: "category" },
            { label: "ID Proof", data: IdCardType, field: "idProof" },
            {
              label: "Education Qualification",
              data: frameworksEdu,
              field: "eduqualification",
            },
            {
              label: "Bathroom",
              data: bathroomOptions.map((b) => ({ value: b, label: b })),
              field: "bathroom",
            },
          ].map(({ label, data, field }) => (
            <div key={field}>
              <label className="block text-gray-700 mb-1">{label}</label>
              <ComboboxDemo
                frameworks={data}
                heading={`Select ${label}`}
                value={formData[field as keyof typeof initialFormData]}
                setValue={setFormData}
                data={field}
              />
            </div>
          ))}

          {enqinp2.map(({ label, field }) => (
            <div key={field}>
              <label className="block text-gray-700 mb-1">{label}</label>
              <Input
                type="text"
                value={formData[field as keyof typeof initialFormData]}
                onChange={(e) => handleChange(field, e.target.value)}
                className="w-full border rounded-md p-2"
              />
            </div>
          ))}

          <div></div>

          <div className="flex flex-col justify-center items-center w-full gap-4">
            {/* Dropzone for Profile Image */}
            <div className="w-full md:w-auto">
              <label
                htmlFor="profileImage"
                className="block text-sm font-medium text-gray-700"
              >
                Applicant Image
              </label>
              <Dropzone
                onDrop={(files) => onDrop(files, "profile")}
                accept="image/*"
              />
            </div>

            {/* Profile Image Preview */}
            <div className="flex-1 flex items-start gap-4 min-w-fit mt-2">
              {images.find((img) => img.category === "profile") && (
                <div className="relative w-auto h-[98.91px]">
                  <motion.img
                    src={images.find((img) => img.category === "profile")?.src}
                    alt="profile_image"
                    className="w-32 h-32 object-cover rounded-md shadow-md"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                  <button
                    onClick={() => handleDeleteImage("profile")}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-700 shadow-lg"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center items-center w-full gap-4">
            {/* Dropzone for Signature Image */}
            <div className="w-full md:w-auto">
              <label
                htmlFor="signatureImage"
                className="block text-sm font-medium text-gray-700"
              >
                Applicant Signature
              </label>
              <Dropzone
                onDrop={(files) => onDrop(files, "signature")}
                accept="image/*"
              />
            </div>

            {/* Signature Image Preview */}
            <div className="flex-1 flex items-start gap-4 min-w-fit mt-2">
              {images.find((img) => img.category === "signature") && (
                <div className="relative w-auto h-[98.91px]">
                  <motion.img
                    src={
                      images.find((img) => img.category === "signature")?.src
                    }
                    alt="signature_image"
                    className="w-32 h-32 object-cover rounded-md shadow-md"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                  <button
                    onClick={() => handleDeleteImage("signature")}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-700 shadow-lg"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center">
          <Button
            type="submit"
            disabled={loading}
            className="w-1/3 block bg-violet-600 hover:bg-violet-700 text-white rounded-lg mt-4"
          >
            Submit {loading && <Loader2 className="animate-spin" />}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
export default FranchiseForm;
