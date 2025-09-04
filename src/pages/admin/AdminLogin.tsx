"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

interface AdminLoginInputs {
  email: string;
  password: string;
}

interface ApiResponse {
  token?: string;
  message?: string;
  status?: boolean;
}

const schema = yup.object({
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

const API_BASE_URL = "https://wtsacademy.dedicateddevelopers.us/api";

const AdminLogin: React.FC = () => {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginInputs>({
    resolver: yupResolver(schema),
  });

  const mutation = useMutation<ApiResponse, Error, AdminLoginInputs>({
    mutationFn: async (data) => {
      const response = await axios.post<ApiResponse>(
        `${API_BASE_URL}/admin/login`,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem(
          "adminAuthToken",
          JSON.stringify({ token: data.token, timestamp: Date.now() })
        );
        toast.success("Admin login successful!");
        router.push("/admin"); 
      }
    },
    onError: (error) => {
      toast.error(error.message || "Admin login failed");
    },
  });

  const onSubmit = (data: AdminLoginInputs) => {
    mutation.mutate(data);
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)" }}
    >
      <Paper
        sx={{
          p: 4,
          maxWidth: 400,
          width: "100%",
          borderRadius: 3,
          background: "rgba(30,30,40,0.95)",
        }}
      >
        <Typography variant="h5" align="center" mb={3} color="#fff">
          Admin Login
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Admin Email"
                fullWidth
                margin="normal"
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{ input: { color: "#fff" }, label: { color: "#bbb" } }}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="password"
                label="Password"
                fullWidth
                margin="normal"
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={{ input: { color: "#fff" }, label: { color: "#bbb" } }}
              />
            )}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3, py: 1.5 }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <CircularProgress size={22} sx={{ color: "#fff" }} />
            ) : (
              "Login as Admin"
            )}
          </Button>
        </form>

        {mutation.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Login failed. Please try again.
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default AdminLogin;
