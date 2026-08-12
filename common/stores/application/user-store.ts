import { proxy } from "valtio";

import type { User } from "@/common/types/application/user";

type UserStoreState = {
  user?: User;
  update: {
    user: (user: User | undefined) => void;
  };
};

/**
 * Session-only client store. Orders live in React Query, not here.
 */
const userStore = proxy<UserStoreState>({
  user: undefined,
  update: {
    user: (user: User | undefined) => {
      userStore.user = user;
    },
  },
});

export default userStore;
