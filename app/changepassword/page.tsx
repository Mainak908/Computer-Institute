"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import anime from "animejs";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store";
import { fetcherWc } from "@/helper";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      animateError();
      return;
    }

    const data = await fetcherWc("/ChangePassword", "POST", {
      oldPassword,
      email: user?.email,
      newPassword,
    });

    if (!data.success) {
      toast("failed to update");
      return;
    }

    toast.success("successful");
    router.replace("/admin");
    setError("");
  };

  const animateError = () => {
    anime({
      targets: "#error-text",
      translateX: [0, -10, 10, -10, 10, 0],
      duration: 500,
      easing: "easeInOutSine",
    });
  };

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col justify-center items-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-96 p-8 bg-gray-900 text-white rounded-2xl shadow-lg"
      >
        <h2 className="text-xl font-semibold text-center mb-6">
          Change Password
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <motion.input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
            whileFocus={{ scale: 1.05 }}
          />

          <motion.input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
            whileFocus={{ scale: 1.05 }}
          />

          <motion.input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
            whileFocus={{ scale: 1.05 }}
          />

          {error && (
            <motion.p
              id="error-text"
              className="text-red-500 text-sm text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="submit"
              className="w-full p-3 bg-violet-700 hover:bg-violet-800 text-white rounded-lg"
            >
              Change Password
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default ChangePassword;
