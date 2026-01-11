"use client";

import { RPCLink } from "@orpc/client/fetch";
import { createORPCClient } from "@orpc/client";
import { createORPCReactQueryUtils } from "@orpc/react-query";
import type { router } from "@/server/router";
import type { RouterClient } from "@orpc/server";

const link = new RPCLink({
    url: () => {
        if (typeof window === 'undefined') {
            throw new Error('RPCLink is not allowed on the server side.');
        }
        return `${window.location.origin}/api/rpc`;
    },
});

const orpcClient: RouterClient<typeof router> = createORPCClient(link);

export const orpc = createORPCReactQueryUtils(orpcClient);

