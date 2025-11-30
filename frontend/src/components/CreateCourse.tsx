import {
	Box,
	Button,
	Card,
	Flex,
	Heading,
	Text,
	TextArea,
	TextField,
} from "@radix-ui/themes";
import { useState } from "react";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { createListLectureTx } from "../utils/tx-helpers";
import { useNetworkVariables } from "../networkConfig";

interface CreateCourseProps {
	onBack: () => void;
}

export function CreateCourse({ onBack }: CreateCourseProps) {
	const { mutate: signAndExecute } = useSignAndExecuteTransaction();
	const { packageId } = useNetworkVariables() as any;
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		price: "",
		imageUrl: "",
		contentLink: "",
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handlePublish = () => {
		if (
			!formData.title ||
			!formData.description ||
			!formData.price ||
			!formData.imageUrl ||
			!formData.contentLink
		) {
			alert("Please fill all fields");
			return;
		}

		const tx = createListLectureTx(
			packageId,
			formData.title,
			formData.description,
			formData.imageUrl,
			formData.contentLink,
			Number(formData.price)
		);

		signAndExecute(
			{ transaction: tx },
			{
				onSuccess: () => {
					alert("Course Published!");
					setFormData({
						title: "",
						description: "",
						price: "",
						imageUrl: "",
						contentLink: "",
					});
					onBack();
				},
				onError: (err) => {
					console.error(err);
					alert("Failed to publish course");
				},
			}
		);
	};

	return (
		<Flex justify="center" p="4">
			<Card size="4" style={{ width: "100%", maxWidth: 600 }}>
				<Heading size="6" mb="4">
					Create New Course
				</Heading>

				<Flex direction="column" gap="4">
					<Box>
						<Text as="div" size="2" mb="1" weight="bold">
							Course Title
						</Text>
						<TextField.Root
							name="title"
							placeholder="e.g. Master Sui Move"
							value={formData.title}
							onChange={handleChange}
						/>
					</Box>

					<Box>
						<Text as="div" size="2" mb="1" weight="bold">
							Description
						</Text>
						<TextArea
							name="description"
							placeholder="Describe what students will learn..."
							value={formData.description}
							onChange={handleChange}
							style={{ minHeight: 100 }}
						/>
						<Text size="1" color="gray" mt="1">
							Markdown is supported. You can use # for headers, - for lists, etc.
						</Text>
					</Box>

					<Box>
						<Text as="div" size="2" mb="1" weight="bold">
							Price (SUITUDY)
						</Text>
						<TextField.Root
							name="price"
							type="number"
							placeholder="e.g. 50"
							value={formData.price}
							onChange={handleChange}
						/>
					</Box>

					<Box>
						<Text as="div" size="2" mb="1" weight="bold">
							Cover Image URL
						</Text>
						<TextField.Root
							name="imageUrl"
							placeholder="https://..."
							value={formData.imageUrl}
							onChange={handleChange}
						/>
						{formData.imageUrl && (
							<Box mt="2">
								<img
									src={formData.imageUrl}
									alt="Preview"
									style={{
										width: "100%",
										height: 150,
										objectFit: "cover",
										borderRadius: "var(--radius-2)",
									}}
									onError={(e) => (e.currentTarget.style.display = "none")}
								/>
							</Box>
						)}
					</Box>

					<Box>
						<Text as="div" size="2" mb="1" weight="bold">
							Content Link (Private)
						</Text>
						<TextField.Root
							name="contentLink"
							placeholder="Google Drive, YouTube, or Walrus ID..."
							value={formData.contentLink}
							onChange={handleChange}
						/>
					</Box>

					<Flex gap="3" mt="4" justify="end">
						<Button variant="soft" color="gray" onClick={onBack}>
							Cancel
						</Button>
						<Button onClick={handlePublish}>Publish Course</Button>
					</Flex>
				</Flex>
			</Card>
		</Flex>
	);
}
