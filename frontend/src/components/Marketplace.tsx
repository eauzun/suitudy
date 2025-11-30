import { Badge, Box, Button, Callout, Card, Container, Flex, Grid, Heading, Inset, Text } from "@radix-ui/themes";
import { useSuiClient, useSuiClientQuery } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import { useNetworkVariables } from "../networkConfig";
import { BuyButton } from "./BuyButton";
import { SuiObjectResponse } from "@mysten/sui/client";

interface Course {
	id: string;
	title: string;
	price: number;
	instructor: string;
	image: string;
	description: string;
}

interface MarketplaceProps {
	onBack: () => void;
	onCourseSelect: (course: Course) => void;
}

export function Marketplace({ onBack, onCourseSelect }: MarketplaceProps) {
	const { packageId } = useNetworkVariables() as any;

	const { data: events, isPending, error } = useSuiClientQuery(
		"queryEvents",
		{
			query: {
				MoveModule: {
					package: packageId,
					module: "suitudy",
				},
			},
			order: "descending",
		}
	);

	const courses: Course[] = events?.data
		.filter((event) => event.type.includes("::LectureListed"))
		.map((event) => {
			const parsed = event.parsedJson as any;
			console.log("Parsed Event Data:", parsed); // Debugging log
			return {
				id: parsed.lecture_id,
				title: parsed.title,
				instructor: parsed.instructor,
				price: Number(parsed.price) / 1_000_000_000,
				image: parsed.image_url || "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80",
				description: "", // Placeholder, will be fetched
			};
		}) || [];

	const [verifiedCourses, setVerifiedCourses] = useState<Course[]>([]);
	const client = useSuiClient();

	useEffect(() => {
		const verifyCourses = async () => {
			if (courses.length === 0) {
				setVerifiedCourses([]);
				return;
			}

			const ids = courses.map((c) => c.id);
			const objects = await client.multiGetObjects({
				ids,
				options: { showContent: true },
			});

			const validCoursesMap = new Map();

			objects.forEach((obj) => {
				if (obj.data && !obj.error) {
					const fields = (obj.data.content as any)?.fields;
					if (fields) {
						validCoursesMap.set(obj.data.objectId, {
							image: fields.image_url,
							description: fields.description,
						});
					}
				}
			});

			const verified = courses
				.filter((c) => validCoursesMap.has(c.id))
				.map((c) => ({
					...c,
					image: validCoursesMap.get(c.id).image || c.image,
					description: validCoursesMap.get(c.id).description || "No description available.",
				}));

			setVerifiedCourses(verified);
		};

		verifyCourses();
	}, [events, client]);

	return (
		<Container size="4" p="4">
			<Flex justify="between" align="center" mb="6">
				<Heading size="6">Explore Courses</Heading>
				<Button variant="ghost" onClick={onBack} style={{ cursor: "pointer" }}>
					← Back to Home
				</Button>
			</Flex>

			{isPending && <Text>Loading courses...</Text>}

			{error && (
				<Callout.Root color="red">
					<Callout.Text>Error loading courses: {error.message}</Callout.Text>
				</Callout.Root>
			)}

			{!isPending && !error && verifiedCourses.length === 0 && (
				<Text>No courses found.</Text>
			)}

			<Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
				{verifiedCourses.map((course) => (
					<Box
						key={course.id}
						onClick={() => onCourseSelect(course)}
						style={{ cursor: "pointer" }}
					>
						<Card size="2" style={{ transition: "transform 0.2s" }}>
							<Inset clip="padding-box" side="top" pb="current">
								<img
									src={course.image || "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80"}
									alt={course.title}
									style={{
										display: "block",
										objectFit: "cover",
										width: "100%",
										height: 140,
										backgroundColor: "var(--gray-5)",
									}}
									onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80")}
								/>
							</Inset>
							<Flex direction="column" gap="2">
								<Heading size="4" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
									{course.title}
								</Heading>
								<Text size="2" color="gray">
									By {course.instructor.slice(0, 6)}...{course.instructor.slice(-4)}
								</Text>
								<Flex justify="between" align="center" mt="2">
									<Badge color="green" size="2">
										{course.price} SUITUDY
									</Badge>
									<BuyButton lectureId={course.id} price={course.price} />
								</Flex>
							</Flex>
						</Card>
					</Box>
				))}
			</Grid>
		</Container>
	);
}
