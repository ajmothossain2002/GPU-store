"use client";

import React from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Input,
  Alert,
  FormHelperText,
  Paper,
  Container,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

// ✅ Types
export interface RegisterFormInputs {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  profile_pic: FileList | null;
}

interface ApiResponse {
  token?: string;
  message?: string;
  status?: boolean;
  data?: unknown;
}

interface ApiError {
  message?: string;
  errors?: Record<string, string[]>;
  status?: number;
}

// ✅ Validation Schema (production-safe)
const registerSchema = z.object({
  first_name: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters"),

  last_name: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Last name can only contain letters"),

  email: z.string().email("Please enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  profile_pic: z
    .any()
    .refine((files) => files && files.length > 0, {
      message: "Profile picture is required",
    })
    .refine(
      (files) =>
        !files || files.length === 0 || files[0].size <= 5 * 1024 * 1024,
      { message: "File size must be less than 5MB" }
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
          files[0].type
        ),
      { message: "Only JPEG, PNG, and WebP images are allowed" }
    ),
});

const API_BASE_URL = "https://wtsacademy.dedicateddevelopers.us/api";

const RegisterForm: React.FC = () => {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      profile_pic: null,
    },
  });

  // ✅ Utility: store token
  const storeToken = (token: string) => {
    if (typeof window !== "undefined") {
      try {
        const tokenData = {
          token,
          timestamp: Date.now(),
          expiresIn: 24 * 60 * 60 * 1000,
        };
        localStorage.setItem("authToken", JSON.stringify(tokenData));
      } catch (error) {
        console.error("Failed to store token:", error);
        toast.error("Failed to save authentication data");
      }
    }
  };

  const mutation = useMutation<
    ApiResponse,
    AxiosError<ApiError>,
    RegisterFormInputs
  >({
    mutationFn: async (formData) => {
      const payload = new FormData();
      payload.append("first_name", formData.first_name.trim());
      payload.append("last_name", formData.last_name.trim());
      payload.append("email", formData.email.toLowerCase().trim());
      payload.append("password", formData.password);

      if (formData.profile_pic && formData.profile_pic.length > 0) {
        payload.append("profile_pic", formData.profile_pic[0]);
      }

      const response = await axios.post<ApiResponse>(
        `${API_BASE_URL}/user/signup`,
        payload,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      return response.data;
    },

    onSuccess: (data) => {
      if (data.token) {
        storeToken(data.token);
      }

      toast.success(data.message || "Registration successful!");
      reset();

      setTimeout(() => {
        router.push("/login");
      }, 1000);
    },

    onError: (error) => {
      if (error.response?.data) {
        const apiError = error.response.data;
        if (apiError.errors) {
          Object.entries(apiError.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              setError(field as keyof RegisterFormInputs, {
                type: "server",
                message: messages[0],
              });
            }
          });
          toast.error("Please check the form for errors");
          return;
        }
        toast.error(apiError.message || "Registration failed");
      } else {
        toast.error(error.message || "Network error");
      }
    },
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    await mutation.mutateAsync(data);
  };

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          maxWidth: 500,
          width: "100%",
          p: 5,
          borderRadius: 4,
          boxShadow: "0px 10px 25px rgba(0,0,0,0.2)",
          background: "#ffffff",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          fontWeight="bold"
          sx={{
            background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
            backgroundClip: "text",
            textFillColor: "transparent",
          }}
        >
          Create Account
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* First Name */}
          <Controller
            name="first_name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="First Name"
                fullWidth
                margin="normal"
                error={!!errors.first_name}
                helperText={errors.first_name?.message}
                disabled={mutation.isPending}
              />
            )}
          />

          {/* Last Name */}
          <Controller
            name="last_name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Last Name"
                fullWidth
                margin="normal"
                error={!!errors.last_name}
                helperText={errors.last_name?.message}
                disabled={mutation.isPending}
              />
            )}
          />

          {/* Email */}
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                type="email"
                fullWidth
                margin="normal"
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={mutation.isPending}
              />
            )}
          />

          {/* Password */}
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={mutation.isPending}
              />
            )}
          />

          {/* Profile Picture */}
          <Box mt={2} mb={1}>
            <Typography variant="body2" component="label" htmlFor="profile-pic-input">
              Profile Picture *
            </Typography>
            <Controller
              name="profile_pic"
              control={control}
              render={({ field: { onChange, name } }) => (
                <Input
                  id="profile-pic-input"
                  name={name}
                  type="file"
                  fullWidth
                  inputProps={{
                    accept: "image/jpeg,image/jpg,image/png,image/webp",
                  }}
                  onChange={(e) => {
                    const target = e.target as HTMLInputElement;
                    onChange(target.files);
                  }}
                  disabled={mutation.isPending}
                  sx={{ mt: 1 }}
                />
              )}
            />
            {errors.profile_pic && (
              <FormHelperText error>{errors.profile_pic.message}</FormHelperText>
            )}
          </Box>

          {/* Submit */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{
              mt: 3,
              py: 1.5,
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 700,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              },
            }}
            disabled={mutation.isPending || isSubmitting}
          >
            {mutation.isPending ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>

          {mutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Registration failed. Please try again.
            </Alert>
          )}
        </form>

        <Typography variant="body2" align="center" mt={3}>
          Already have an account?{" "}
          <Button
            variant="text"
            onClick={() => router.push("/login")}
            sx={{ color: "#6366f1", fontWeight: 600 }}
          >
            Sign In
          </Button>
        </Typography>
      </Paper>
    </Container>
  );
};

export default RegisterForm;
