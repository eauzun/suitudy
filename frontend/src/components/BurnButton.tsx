import { AlertDialog, Button, Flex } from "@radix-ui/themes";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useNetworkVariables } from "../networkConfig";
import { createBurnPassTx } from "../utils/tx-helpers";

interface BurnButtonProps {
	passId: string;
	onSuccess?: () => void;
}

export function BurnButton({ passId, onSuccess }: BurnButtonProps) {
	const { mutate: signAndExecute } = useSignAndExecuteTransaction();
	const { packageId } = useNetworkVariables() as any;

	const handleBurn = () => {
		const tx = createBurnPassTx(packageId, passId);

		signAndExecute(
			{ transaction: tx },
			{
				onSuccess: () => {
					alert("Burned successfully");
					onSuccess?.();
				},
				onError: (err) => {
					console.error(err);
					alert("Failed to burn pass");
				},
			}
		);
	};

	return (
		<AlertDialog.Root>
			<AlertDialog.Trigger>
				<Button size="1" variant="soft" color="ruby" style={{ cursor: "pointer" }}>
					Burn Pass
				</Button>
			</AlertDialog.Trigger>
			<AlertDialog.Content maxWidth="450px">
				<AlertDialog.Title>Burn Ticket?</AlertDialog.Title>
				<AlertDialog.Description size="2">
					This action cannot be undone. You will lose access to this course.
				</AlertDialog.Description>

				<Flex gap="3" mt="4" justify="end">
					<AlertDialog.Cancel>
						<Button variant="soft" color="gray" style={{ cursor: "pointer" }}>
							Cancel
						</Button>
					</AlertDialog.Cancel>
					<AlertDialog.Action>
						<Button variant="solid" color="ruby" onClick={handleBurn} style={{ cursor: "pointer" }}>
							Yes, Burn it
						</Button>
					</AlertDialog.Action>
				</Flex>
			</AlertDialog.Content>
		</AlertDialog.Root>
	);
}
