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

interface CreateCourseProps {
	onBack: () => void;
}

export function CreateCourse({ onBack }: CreateCourseProps) {
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

	const handleSubmit = () => {
		console.log("Publishing Course:", formData);
		// TODO: Connect to Smart Contract
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
					</Box>

					<Box>
						<Text as="div" size="2" mb="1" weight="bold">
							Price (EP)
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
						<Button onClick={handleSubmit}>Publish Course</Button>
					</Flex>
				</Flex>
			</Card>
		</Flex>
	);
}
