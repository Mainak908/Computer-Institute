"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { motion } from "framer-motion";
import anime from "animejs";
import { Trash2 } from "lucide-react";
import { marks } from "@/data/index";
import { fetcherWc } from "@/helper";
import { toast } from "react-toastify";
import { ApiResponse, EnrollmentData } from "./ExamRegForm";

interface Subject {
  subject: string;
  theoryFullMarks: string;
  practicalFullMarks: string;
  theoryMarks: string;
  practicalMarks: string;
}

const Marksheet = () => {
  const [subjects, setSubjects] = useState<Subject[]>([
    {
      subject: "",
      theoryFullMarks: "",
      practicalFullMarks: "",
      theoryMarks: "",
      practicalMarks: "",
    },
  ]);

  const [totalMarks, setTotalMarks] = useState<number>(0);
  const [percentage, setPercentage] = useState<number>(0);
  const [grade, setGrade] = useState<string>("N/A");
  const [enrollmentNo, setenrollmentNo] = useState("");
  const [year, setyear] = useState("");
  const [fd, setfd] = useState<EnrollmentData>();

  useEffect(() => {
    anime({
      targets: ".marks-row",
      opacity: [0, 1],
      translateY: [20, 0],
      easing: "easeOutExpo",
      duration: 500,
    });
  }, [subjects]);

  useEffect(() => {
    const totalObtained = subjects.reduce(
      (sum, item) =>
        sum +
        (parseInt(item.theoryMarks) || 0) +
        (parseInt(item.practicalMarks) || 0),
      0
    );

    const fullMarks = subjects.reduce(
      (sum, item) =>
        sum +
        (parseInt(item.theoryFullMarks) || 0) +
        (parseInt(item.practicalFullMarks) || 0),
      0
    );

    setTotalMarks(totalObtained);

    if (fullMarks > 0) {
      const calculatedPercentage = (totalObtained / fullMarks) * 100;
      setPercentage(parseFloat(calculatedPercentage.toFixed(2)));
      setGrade(getGrade(calculatedPercentage));
    } else {
      setPercentage(0);
      setGrade("N/A");
    }
  }, [subjects]);

  const details = [
    { key: "sName", label: "Student Name", value: fd?.name || "" },
    { key: "swdName", label: "S/W/D Name", value: fd?.father || "" },

    { key: "courseName", label: "Course Name", value: fd?.course.CName || "" },
    {
      key: "centerName",
      label: "Center Name",
      value: fd?.center.Centername || "",
    },
    { key: "cAddress", label: "Center Address", value: fd?.address || "" },
    {
      key: "dob",
      label: "Date of Birth",
      value: fd && fd.dob ? new Date(fd.dob).toLocaleDateString() : "",
    },
  ];

  const fetchData = async () => {
    const data = (await fetcherWc("/exmformfillupDatafetch", "POST", {
      enrollmentNo,
    })) as ApiResponse;
    setfd(data.data);
  };

  const handleChange3 = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;

    if (value.length <= 14) {
      setenrollmentNo(value);
    }
  };

  useEffect(() => {
    if (enrollmentNo.length === 14) {
      toast("plz wait while data is fetching...");
      fetchData();
    }
  }, [enrollmentNo]);

  const getGrade = (percentage: number): string => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    if (percentage >= 40) return "D";
    return "F";
  };

  const allFieldsFilled = subjects.every(
    (item) =>
      item.subject.trim() !== "" &&
      item.theoryMarks.trim() !== "" &&
      item.practicalMarks.trim() !== "" &&
      item.theoryFullMarks.trim() !== "" &&
      item.practicalFullMarks.trim() !== ""
  );

  const handleAddRow = () => {
    if (!allFieldsFilled) {
      alert("Please fill all fields before adding a new row!");
      return;
    }
    setSubjects([
      ...subjects,
      {
        subject: "",
        theoryFullMarks: "",
        practicalFullMarks: "",
        theoryMarks: "",
        practicalMarks: "",
      },
    ]);
  };

  const handleChange = (index: number, field: string, value: string) => {
    const newSubjects = [...subjects];
    newSubjects[index][field as keyof (typeof newSubjects)[number]] = value;
    setSubjects(newSubjects);
  };

  const handleDeleteRow = (index: number) => {
    const newSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(newSubjects);
  };
  //  const { EnrollmentNo, marks, remarks, grade, percentage, totalMarks, year } =

  const handleSubmit = async () => {
    if (!allFieldsFilled) {
      toast("Please fill all fields before submitting!");
      return;
    }
    const data = await fetcherWc("/exmmarksentry", "POST", {
      EnrollmentNo: enrollmentNo,
      marks: subjects,

      grade,
      percentage,
      totalMarks,
      year,
    });
    data.ok
      ? toast("Marksheet submitted successfully!")
      : toast("error happened");
  };

  const handlePreview = () => {
    if (!allFieldsFilled) {
      alert("Please fill all fields before previewing!");
      return;
    }
    alert(
      `Preview:\n${JSON.stringify(
        subjects,
        null,
        2
      )}\nTotal Marks: ${totalMarks}\nPercentage: ${percentage}%\nGrade: ${grade}`
    );
  };

  return (
    <div className="max-w-4xl mx-auto my-10 p-10 bg-white text-black rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-2 text-center">Marksheet</h2>
      <p className="text-gray-500 text-center mb-6">
        Clearly fill the form below
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 my-6">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Enrollment no</label>
          <input
            type="text"
            onChange={handleChange3}
            placeholder="enter enrollment number"
            className="p-2 h-10 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-violet-500 focus:outline-none"
          />
        </div>
        {details.map((item, index) => (
          <div key={index} className="flex flex-col">
            <label className="text-sm font-medium mb-1">{item.label}</label>
            <div className="p-2 h-10 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-violet-500 focus:outline-none">
              {item.value}
            </div>
          </div>
        ))}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Year</label>
          <input
            type="text"
            onChange={(e) => setyear(e.target.value)}
            value={year}
            placeholder="enter year"
            className="p-2 h-10 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-violet-500 focus:outline-none"
          />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center font-bold bg-gray-200 p-3 rounded-lg">
        <span>Subject</span>
        <span>Theory Full Marks</span>
        <span>Practical Full Marks</span>
        <span>Theory Marks</span>
        <span>Practical Marks</span>
        <span>Total</span>
        <span>Action</span>
      </div>
      <div className="space-y-2 mt-2">
        {subjects.map((item, index) => (
          <motion.div
            key={index}
            className="marks-row grid grid-cols-7 gap-2 p-2 bg-gray-100 border border-gray-300 rounded-lg items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {marks.map((items, i) => (
              <input
                key={i}
                name={items.name}
                type={items.type}
                pattern={items.pattern}
                placeholder={items.placeholder}
                onChange={(e) =>
                  handleChange(
                    index,
                    items.name as keyof Subject,
                    e.target.value
                  )
                }
                className="p-2 bg-white border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ))}
            <p className="text-center font-bold text-blue-500">
              {parseInt(item.theoryMarks) + parseInt(item.practicalMarks) || 0}
            </p>
            <button
              onClick={() => handleDeleteRow(index)}
              className="p-2 bg-red-500 hover:bg-red-600 transition rounded text-white"
            >
              <Trash2 className="mx-auto" size={20} />
            </button>
          </motion.div>
        ))}
        <button
          onClick={handleAddRow}
          className={`w-full p-3 rounded text-white font-bold ${
            allFieldsFilled
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!allFieldsFilled}
        >
          + Add New Row
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-6 text-center">
        <motion.p className="text-lg font-semibold">
          Total Marks: <span className="text-blue-500">{totalMarks}</span>
        </motion.p>
        <motion.p className="text-lg font-semibold text-center">
          Percentage: <span className="text-green-500">{percentage}%</span>
        </motion.p>
        <motion.p className="text-lg font-semibold text-center">
          Grade: <span className="text-purple-500">{grade}</span>
        </motion.p>
      </div>
      <div className="mt-4 flex justify-between">
        <button
          onClick={handlePreview}
          className={`w-1/2 p-2 rounded text-white font-bold mx-2 ${
            allFieldsFilled
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-500 cursor-not-allowed"
          }`}
          disabled={!allFieldsFilled}
        >
          Preview
        </button>
        <button
          onClick={handleSubmit}
          className={`w-1/2 p-2 rounded text-white font-bold mx-2 ${
            allFieldsFilled
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-500 cursor-not-allowed"
          }`}
          disabled={!allFieldsFilled}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default Marksheet;
