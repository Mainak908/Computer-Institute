import axios from "axios";
import { DataItem } from "./lib/typs";
import { Subject } from "./app/admin/@dashboard/subjectentry/page";

interface iDatatype {
  email?: string;
  name?: string;
  password?: string;
  EnrollmentNo?: number;
  id?: number;
  marks?: any;
  remarks?: "PASS" | "FAIL" | "Select";
  grade?: string;
  percentage?: number;
  totalMarks?: number;
  year?: string;
  ExamCenterCode?: String;
  ATI_CODE?: string;
  amountPaid?: number;
  tp?: number;
  ar?: number;
  lprn?: string;
  data?: any;
  imageUrl?: string;
  enrollment?: DataItem;
  signatureLink?: string;
  c?: Subject[];
  subject?: string;
  details?: string;
  expiryDate?: string;
  oldPassword?: string;
  newPassword?: string;
  cid?: string;
  Prefix?: string;
  Links?: {};
  filteredVal?: number;
}

const ApiEnd = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_ENDPOINT,
});

export const fetcherWc = async (
  url: string,
  method: string,
  data?: iDatatype
) =>
  ApiEnd({
    url,
    method,
    data,
    withCredentials: true,
  }).then((response) => response.data);

export const fetcher = async (url: string, method: string, data?: iDatatype) =>
  ApiEnd({
    url,
    method,
    data,
  }).then((response) => response.data);
