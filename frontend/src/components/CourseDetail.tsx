import {
	Badge,
	Button,
	Container,
	Flex,
	Grid,
	Heading,
	Inset,
	Separator,
	Text,
} from "@radix-ui/themes";

interface Course {
	id: number;
	title: string;
	price: number;
	instructor: string;
	image: string;
}

interface CourseDetailProps {
	course: Course;
	onBack: () => void;
}

export function CourseDetail({ course, onBack }: CourseDetailProps) {
	return (
		<Container size="4" p="4">
			<Button variant="ghost" onClick={onBack} mb="4">
				← Back to Marketplace
			</Button>

			<Grid columns={{ initial: "1", md: "2" }} gap="6">
				{/* Left Column: Image */}
				<Inset clip="padding-box" side="top" pb="current">
					<img
						src={course.image}
						alt={course.title}
						style={{
							display: "block",
							objectFit: "cover",
							width: "100%",
							height: "100%",
							maxHeight: "400px",
							borderRadius: "var(--radius-3)",
							backgroundColor: "var(--gray-5)",
						}}
					/>
				</Inset>

				{/* Right Column: Details */}
				<Flex direction="column" gap="4">
					<Box>
						<Badge color="iris" size="2" mb="2">
							Software
						</Badge>
						<Heading size="8" mb="2">
							{course.title}
						</Heading>
						<Text size="3" color="gray">
							Instructor: {course.instructor}
						</Text>
					</Box>

					<Text size="6" color="iris" weight="bold">
						{course.price} EP
					</Text>

					<Button
						size="3"
						style={{ width: "100%" }}
						onClick={() => console.log("Connect to Sui Logic here")}
					>
						Enroll Now
					</Button>

					<Separator my="4" />

					<Box>
						<Heading size="4" mb="2">
							Course Content
						</Heading>
						<Text as="p" size="3" color="gray" style={{ lineHeight: 1.6 }}>
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
							eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
							enim ad minim veniam, quis nostrud exercitation ullamco laboris
							nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
							reprehenderit in voluptate velit esse cillum dolore eu fugiat
							nulla pariatur. Excepteur sint occaecat cupidatat non proident,
							sunt in culpa qui officia deserunt mollit anim id est laborum.
						</Text>
					</Box>
				</Flex>
			</Grid>
		</Container>
	);
}

// Helper Box component to avoid import issues if not available globally
import { Box } from "@radix-ui/themes";
