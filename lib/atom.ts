import { atom, useRecoilValue } from "recoil";
import { User } from "firebase/auth";
import { recoilPersist } from "recoil-persist";
const { persistAtom } = recoilPersist();

type UserState = User | null;

interface todosState {
  id: string | number;
  uid: string | null;
  title: string;
  date: any;
  detail: string | null;
  status: string;
}

export const userState = atom<UserState>({
  key: "userState",
  default: null,
  dangerouslyAllowMutability: true,
  effects_UNSTABLE: [persistAtom],
});

export const useUser = (): UserState => {
  return useRecoilValue(userState);
};

export const todosState = atom<todosState[]>({
  key: "todosState",
  default: Array(),
  dangerouslyAllowMutability: true,
  effects_UNSTABLE: [persistAtom],
});

export const useTodo = (): todosState[] => {
  return useRecoilValue(todosState);
};
