import { AlertDialog, Button, Flex } from "@radix-ui/themes";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useNetworkVariables } from "../networkConfig";
import { createDeleteLectureTx } from "../utils/tx-helpers";

interface DeleteLectureButtonProps {
	lectureId: string;
	onSuccess?: () => void;
}

export function DeleteLectureButton({ lectureId, onSuccess }: DeleteLectureButtonProps) {
	const { mutate: signAndExecute } = useSignAndExecuteTransaction();
	const { packageId } = useNetworkVariables() as any;

	const handleDelete = () => {
		const tx = createDeleteLectureTx(packageId, lectureId);

		signAndExecute(
			{ transaction: tx },
			{
				onSuccess: () => {
					alert("Course deleted");
					onSuccess?.();
				},
				onError: (err) => {
					console.error(err);
					alert("Failed to delete lecture");
				},
			}
		);
	};

	return (
		<AlertDialog.Root>
			<AlertDialog.Trigger>
				<Button size="1" variant="outline" color="red" style={{ cursor: "pointer" }}>
					Delete Course
				</Button>
			</AlertDialog.Trigger>
			<AlertDialog.Content maxWidth="450px">
				<AlertDialog.Title>Delete Course?</AlertDialog.Title>
				<AlertDialog.Description size="2">
					This will remove the course from the marketplace permanently.
				</AlertDialog.Description>

				<Flex gap="3" mt="4" justify="end">
					<AlertDialog.Cancel>
						<Button variant="soft" color="gray" style={{ cursor: "pointer" }}>
							Cancel
						</Button>
					</AlertDialog.Cancel>
					<AlertDialog.Action>
						<Button variant="solid" color="red" onClick={handleDelete} style={{ cursor: "pointer" }}>
							Yes, Delete it
						</Button>
					</AlertDialog.Action>
				</Flex>
			</AlertDialog.Content>
		</AlertDialog.Root>
	);
}
