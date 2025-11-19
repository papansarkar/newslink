import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Card, Chip, useThemeColor } from "heroui-native";
import { Pressable, Text, View } from "react-native";
import { Container } from "@/components/container";
import { SignIn } from "@/components/sign-in";
import { SignUp } from "@/components/sign-up";
import { authClient } from "@/lib/auth-client";
import { orpc, queryClient } from "@/utils/orpc";

function StatusChip({
  isLoading,
  isConnected,
  successColor,
  dangerColor,
}: {
  isLoading: boolean;
  isConnected: boolean;
  successColor: string;
  dangerColor: string;
}) {
  return (
    <Chip
      className={`gap-1 px-1 ${isConnected ? "border-success text-success" : "border-danger text-danger"} `}
      color={isConnected ? "success" : "danger"}
      size="sm"
      variant="secondary"
    >
      {!isLoading && isConnected && (
        <Ionicons color={successColor} name="checkmark-circle" size={20} />
      )}
      {!(isLoading || isConnected) && (
        <Ionicons color={dangerColor} name="close-circle" size={20} />
      )}
      <Chip.Label>{isConnected ? "LIVE" : "OFFLINE"}</Chip.Label>
    </Chip>
  );
}

function StatusIcon({
  isLoading,
  isConnected,
  mutedColor,
  successColor,
  dangerColor,
}: {
  isLoading: boolean;
  isConnected: boolean;
  mutedColor: string;
  successColor: string;
  dangerColor: string;
}) {
  if (isLoading) {
    return <Ionicons color={mutedColor} name="hourglass-outline" size={20} />;
  }
  if (isConnected) {
    return <Ionicons color={successColor} name="checkmark-circle" size={20} />;
  }
  return <Ionicons color={dangerColor} name="close-circle" size={20} />;
}

export default function Home() {
  const healthCheck = useQuery(orpc.healthCheck.queryOptions());
  const privateData = useQuery(orpc.privateData.queryOptions());
  const isConnected = healthCheck?.data === "OK";
  const isLoading = healthCheck?.isLoading;
  const { data: session } = authClient.useSession();

  const mutedColor = useThemeColor("muted");
  const successColor = useThemeColor("success");
  const dangerColor = useThemeColor("danger");

  const isConnectedApi = isConnected ? "Connected to API" : "API Disconnected";

  return (
    <Container className="p-6">
      <View className="mb-6 py-4">
        <Text className="mb-2 font-bold text-4xl text-foreground">
          BETTER T STACK
        </Text>
      </View>

      {session?.user ? (
        <Card className="mb-6 p-4" variant="secondary">
          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-col">
              <Text className="mb-1 text-base text-foreground">
                Welcome,{" "}
                <Text className="font-medium">{session.user.name}</Text>
              </Text>
              <Text className="text-muted text-sm">{session.user.email}</Text>
            </View>
            <Pressable
              className="rounded-lg bg-danger px-4 py-3 active:opacity-70"
              onPress={() => {
                authClient.signOut();
                queryClient.invalidateQueries();
              }}
            >
              <Text className="font-medium text-foreground">Sign Out</Text>
            </Pressable>
          </View>
        </Card>
      ) : null}

      <Card className="p-6" variant="secondary">
        <View className="mb-4 flex-row items-center justify-between">
          <Card.Title>System Status</Card.Title>
          <StatusChip
            dangerColor={dangerColor}
            isConnected={isConnected}
            isLoading={isLoading}
            successColor={successColor}
          />
        </View>

        <Card className="rounded p-4">
          <View className="flex-row items-center">
            <View
              className={`mr-3 h-3 w-3 rounded-full ${isConnected ? "bg-success" : "bg-muted"}`}
            />
            <View className="flex-1">
              <Text className="mb-1 font-medium text-foreground">
                ORPC Backend
              </Text>
              <Card.Description>
                {isLoading ? "Checking connection..." : isConnectedApi}
              </Card.Description>
            </View>
            <StatusIcon
              dangerColor={dangerColor}
              isConnected={isConnected}
              isLoading={isLoading}
              mutedColor={mutedColor}
              successColor={successColor}
            />
          </View>
        </Card>
      </Card>

      <Card className="mt-6 p-4" variant="secondary">
        <Card.Title className="mb-3">Private Data</Card.Title>
        {privateData && (
          <Card.Description>{privateData.data?.message}</Card.Description>
        )}
      </Card>

      {!session?.user && (
        <>
          <SignIn />
          <SignUp />
        </>
      )}
    </Container>
  );
}
