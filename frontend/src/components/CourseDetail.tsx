import {
	AspectRatio,
	Badge,
	Box,
	Button,
	Callout,
	Card,
	Container,
	Flex,
	Grid,
	Heading,
	Inset,
	Separator,
	Text,
} from "@radix-ui/themes";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { useNetworkVariables } from "../networkConfig";
import { BuyButton } from "./BuyButton";
import { LockClosedIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import ReactMarkdown from "react-markdown";

interface Course {
	id: string;
	title: string;
	price: number;
	instructor: string;
	image: string;
	description: string;
}

interface CourseDetailProps {
	course: Course;
	onBack: () => void;
}

export function CourseDetail({ course, onBack }: CourseDetailProps) {
	const account = useCurrentAccount();
	const { packageId } = useNetworkVariables() as any;

	// Fetch user's owned LecturePass objects
	const { data: ownedObjects, isPending } = useSuiClientQuery(
		"getOwnedObjects",
		{
			owner: account?.address || "",
			filter: {
				StructType: `${packageId}::suitudy::LecturePass`,
			},
			options: {
				showContent: true,
			},
		},
		{
			enabled: !!account,
		}
	);

	// Check if user owns a pass for this specific course
	const ownedPass = ownedObjects?.data.find((obj) => {
		const content = obj.data?.content as any;
		return content?.fields?.lecture_id === course.id;
	});

	const isUnlocked = !!ownedPass;
	const contentUrl = (ownedPass?.data?.content as any)?.fields?.content_url;

	return (
		<Container size="4" p="4">
			<Button variant="ghost" onClick={onBack} mb="4" style={{ cursor: "pointer" }}>
				← Back to Marketplace
			</Button>

			<Grid columns={{ initial: "1", md: "2" }} gap="6">
				{/* Left Column: Image (Always Visible) */}
				<Box>
					<Card size="2">
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
								onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/600x400")}
							/>
						</Inset>
					</Card>
				</Box>

				{/* Right Column: Details & Gated Content */}
				<Flex direction="column" gap="4">
					<Box>
						<Badge color="iris" size="2" mb="2">
							Course
						</Badge>
						<Heading size="8" mb="2">
							{course.title}
						</Heading>
						<Text size="3" color="gray">
							Instructor: {course.instructor}
						</Text>
					</Box>

					<Flex align="center" gap="2">
						<Text size="6" color="iris" weight="bold">
							{course.price} SUITUDY
						</Text>
						{isUnlocked && (
							<Badge color="green" size="3" variant="solid">
								Purchased
							</Badge>
						)}
					</Flex>

					<Separator my="4" />

					{/* Gated Content Area */}
					{isUnlocked ? (
						<Flex direction="column" gap="4">
							<Callout.Root color="green">
								<Callout.Icon>
									<CheckCircledIcon />
								</Callout.Icon>
								<Callout.Text>
									You own this course! ✅
								</Callout.Text>
							</Callout.Root>

							<Box>
								<Heading size="4" mb="2">
									Course Details
								</Heading>
								<Box style={{ color: "var(--gray-11)" }}>
									<ReactMarkdown
										components={{
											h1: ({ node, ...props }: any) => <Heading size="6" mt="4" mb="2" {...props} />,
											h2: ({ node, ...props }: any) => <Heading size="5" mt="3" mb="2" {...props} />,
											p: ({ node, ...props }: any) => <Text as="p" size="3" mb="3" style={{ lineHeight: "1.6" }} {...props} />,
											ul: ({ node, ...props }: any) => <ul style={{ paddingLeft: "20px", marginBottom: "16px" }} {...props} />,
											li: ({ node, ...props }: any) => <li style={{ marginBottom: "8px" }} {...props} />,
											a: ({ node, ...props }: any) => <a style={{ color: "var(--accent-9)", textDecoration: "underline" }} {...props} />,
										}}
									>
										{course.description}
									</ReactMarkdown>
								</Box>
							</Box>

							{contentUrl && (
								<Box mt="2">
									<Button
										variant="outline"
										onClick={() => window.open(contentUrl, "_blank")}
										style={{ cursor: "pointer" }}
									>
										Open Course Content ↗
									</Button>
								</Box>
							)}
						</Flex>
					) : (
						<Card size="3" style={{ backgroundColor: "var(--gray-a2)" }}>
							<Flex direction="column" align="center" gap="4" py="4">
								<LockClosedIcon width="32" height="32" color="var(--gray-9)" />
								<Text align="center" size="3" color="gray">
									Purchase this course to unlock the full description and content details.
								</Text>
								<BuyButton lectureId={course.id} price={course.price} />
							</Flex>
						</Card>
					)}
				</Flex>
			</Grid>
		</Container>
	);
}
