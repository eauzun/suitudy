import { AlertDialog, Button, Flex } from "@radix-ui/themes";
import { useTransactionExecution } from "../hooks/useTransactionExecution";
import { useNetworkVariables } from "../networkConfig";
import { createBurnPassTx } from "../utils/tx-helpers";

interface BurnButtonProps {
	passId: string;
	onSuccess?: () => void;
}

export function BurnButton({ passId, onSuccess }: BurnButtonProps) {
	const { executeTransaction } = useTransactionExecution();
	const { packageId } = useNetworkVariables() as any;

	const handleBurn = async () => {
		try {
			const tx = createBurnPassTx(packageId, passId);
			await executeTransaction(tx);
			alert("Burned successfully");
			onSuccess?.();
		} catch (err: any) {
			console.error(err);
			alert("Failed to burn pass: " + err.message);
		}
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
