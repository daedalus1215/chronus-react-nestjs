import api from "../axios.interceptor";
import { Tag } from "../dtos/tag.dtos";

export const fetchTags = async (): Promise<Tag[]> => {
    const res = await api.get("/tags");
    return res.data;
  };