"use client";
import { useState, useEffect } from "react";
import { getRequestSend, postRequestSend, putRequestSend, deleteRequestSend } from "@/components/ApiCall/methord";
import { useAuth } from "./AuthContext";

type ApiState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export function useApi<T>(url: string, autoFetch = true) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  const { user } = useAuth();

 const getHeaders = (): Record<string, string> => {
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

  const fetchData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await getRequestSend<T>(url, getHeaders());
      if (response.status == 200 && response.data) {
        setState({ data: response.data, loading: false, error: null });
      } else {
        setState({ data: null, loading: false, error: response.message || 'Failed to fetch data' });
      }
    } catch (error) {
      setState({ 
        data: null, 
        loading: false, 
        error: error instanceof Error ? error.message : 'An error occurred' 
      });
    }
  };

  const postData = async <Req,>(data: Req) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await postRequestSend<Req, T>(url, getHeaders(), data);
      if (response.status == 200 || response.status === 201) {
        setState(prev => ({ ...prev, loading: false, error: null }));
        return response.data;
      } else {
        setState(prev => ({ ...prev, loading: false, error: response.message || 'Failed to create data' }));
        throw new Error(response.message || 'Failed to create data');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  };

  const updateData = async <Req,>(data: Req) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await putRequestSend<Req, T>(url, getHeaders(), data);
      if (response.status == 200) {
        setState(prev => ({ ...prev, loading: false, error: null }));
        return response.data;
      } else {
        setState(prev => ({ ...prev, loading: false, error: response.message || 'Failed to update data' }));
        throw new Error(response.message || 'Failed to update data');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  };

  const deleteData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await deleteRequestSend<T>(url, getHeaders());
      if (response.status == 200 || response.status === 204) {
        setState(prev => ({ ...prev, loading: false, error: null }));
        return true;
      } else {
        setState(prev => ({ ...prev, loading: false, error: response.message || 'Failed to delete data' }));
        throw new Error(response.message || 'Failed to delete data');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  };

  const refetch = () => {
    fetchData();
  };

  useEffect(() => {
    if (autoFetch && url) {
      fetchData();
    }
  }, [url, autoFetch, user?.token]);

  return {
    ...state,
    refetch,
    postData,
    updateData,
    deleteData,
  };
}