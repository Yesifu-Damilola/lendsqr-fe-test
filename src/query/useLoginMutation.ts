import { useMutation } from "@tanstack/react-query";
import { loginMutationOptions } from "@/queryOptions/loginMutationOptions";

export function useLoginMutation() {
  return useMutation(loginMutationOptions());
}
