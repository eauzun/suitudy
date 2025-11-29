import { Badge, Box, Button, Card, Container, Flex, Grid, Heading, Inset, Text } from "@radix-ui/themes";
import { useCurrentAccount, useSuiClient, useSuiClientQuery } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import { useNetworkVariables } from "../networkConfig";
import { BurnButton } from "./BurnButton";
import { DeleteLectureButton } from "./DeleteLectureButton";
import { TokenBalance } from "./TokenBalance";

export function UserProfile() {
	const account = useCurrentAccount();
	const { packageId } = useNetworkVariables() as any;
	const [view, setView] = useState<"student" | "instructor">("student");

	// 1. Auth Guard
	if (!account) {
		return (
			<Flex justify="center" align="center" style={{ height: "60vh" }}>
				<Card size="4" style={{ textAlign: "center", padding: "40px" }}>
					<Heading size="6" mb="2">Please Connect Your Wallet</Heading>
					<Text color="gray">You need to connect your wallet to view your dashboard.</Text>
				</Card>
			</Flex>
		);
	}

	// 2. Data Fetching

	// Student View: Get Owned Objects (LecturePass)
	const { data: ownedObjects, isPending: isStudentLoading, refetch: refetchStudent } = useSuiClientQuery(
		"getOwnedObjects",
		{
			owner: account.address,
			filter: {
				StructType: `${packageId}::suitudy::LecturePass`,
			},
			options: {
				showContent: true,
			},
		},
		{
			enabled: view === "student",
		}
	);

	// Instructor View: Get Created Courses (Events)
	const { data: events, isPending: isInstructorLoading, refetch: refetchInstructor } = useSuiClientQuery(
		"queryEvents",
		{
			query: {
				MoveModule: {
					package: packageId,
					module: "suitudy",
				},
			},
			order: "descending",
		},
		{
			enabled: view === "instructor",
		}
	);

	const myCourses = events?.data
		.filter((event) => {
			const parsed = event.parsedJson as any;
			return parsed.instructor === account.address && event.type.includes("::LectureListed");
		})
		.map((event) => {
			const parsed = event.parsedJson as any;
			return {
				id: parsed.lecture_id,
				title: parsed.title,
				image: parsed.image_url,
			};
		}) || [];

	const [verifiedCourses, setVerifiedCourses] = useState<any[]>([]);
	const client = useSuiClient();

	// Verify existence of courses (filter out deleted ones)
	useEffect(() => {
		const verifyCourses = async () => {
			if (myCourses.length === 0) {
				setVerifiedCourses([]);
				return;
			}

			const ids = myCourses.map((c) => c.id);
			const objects = await client.multiGetObjects({
				ids,
				options: { showContent: true },
			});

			const validIds = new Set(
				objects
					.filter((obj) => obj.data && !obj.error)
					.map((obj) => obj.data?.objectId)
			);

			setVerifiedCourses(myCourses.filter((c) => validIds.has(c.id)));
		};

		verifyCourses();
	}, [events, client, view]); // Re-run when events change or view switches

	return (
		<Container size="4" p="4">
			<Heading size="8" mb="6" align="center">My Dashboard</Heading>

			<Box mb="5">
				<TokenBalance />
			</Box>

			{/* Toggle Control */}
			<Flex gap="3" mb="6" p="1" style={{ backgroundColor: "var(--gray-a3)", borderRadius: "var(--radius-3)", width: "100%", maxWidth: 600, margin: "0 auto 32px" }}>
				<Button
					size="3"
					variant={view === "student" ? "solid" : "soft"}
					onClick={() => setView("student")}
					style={{ flex: 1, cursor: "pointer" }}
				>
					My Learning (Student)
				</Button>
				<Button
					size="3"
					variant={view === "instructor" ? "solid" : "soft"}
					onClick={() => setView("instructor")}
					style={{ flex: 1, cursor: "pointer" }}
				>
					My Teachings (Instructor)
				</Button>
			</Flex>

			{/* Student View */}
			{view === "student" && (
				<>
					{isStudentLoading && <Text>Loading your courses...</Text>}
					{!isStudentLoading && (!ownedObjects?.data || ownedObjects.data.length === 0) && (
						<Text align="center" color="gray">You haven't purchased any courses yet.</Text>
					)}

					<Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
						{ownedObjects?.data.map((obj) => {
							const content = obj.data?.content as any;
							const fields = content?.fields;
							if (!fields) return null;

							return (
								<Card key={obj.data?.objectId} size="2">
									<Inset clip="padding-box" side="top" pb="current">
										<img
											src={fields.image_url}
											alt={fields.title}
											style={{
												display: "block",
												objectFit: "cover",
												width: "100%",
												height: 140,
												backgroundColor: "var(--gray-5)",
											}}
											onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/300")}
										/>
									</Inset>
									<Flex direction="column" gap="2">
										<Heading size="4">{fields.title}</Heading>
										<Flex justify="between" align="center" mt="2">
											<Button
												size="1"
												variant="solid"
												onClick={() => window.open(fields.content_url, "_blank")}
												style={{ cursor: "pointer" }}
											>
												Watch
											</Button>
											<BurnButton
												passId={obj.data?.objectId || ""}
												onSuccess={() => refetchStudent()}
											/>
										</Flex>
									</Flex>
								</Card>
							);
						})}
					</Grid>
				</>
			)}

			{/* Instructor View */}
			{view === "instructor" && (
				<>
					{isInstructorLoading && <Text>Loading your created courses...</Text>}
					{!isInstructorLoading && verifiedCourses.length === 0 && (
						<Text align="center" color="gray">You haven't created any courses yet.</Text>
					)}

					<Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
						{verifiedCourses.map((course) => (
							<Card key={course.id} size="2">
								<Inset clip="padding-box" side="top" pb="current">
									<img
										src={course.image}
										alt={course.title}
										style={{
											display: "block",
											objectFit: "cover",
											width: "100%",
											height: 140,
											backgroundColor: "var(--gray-5)",
										}}
										onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/300")}
									/>
								</Inset>
								<Flex direction="column" gap="2">
									<Heading size="4">{course.title}</Heading>
									<Flex justify="end" align="center" mt="2">
										<DeleteLectureButton
											lectureId={course.id}
											onSuccess={() => refetchInstructor()}
										/>
									</Flex>
								</Flex>
							</Card>
						))}
					</Grid>
				</>
			)}
		</Container>
	);
}
