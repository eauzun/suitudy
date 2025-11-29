import { ConnectButton } from "@mysten/dapp-kit";
import {
	Box,
	Button,
	Card,
	Container,
	Flex,
	Grid,
	Heading,
	Inset,
	Strong,
	Text,
	Theme,
} from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { Marketplace } from "./components/Marketplace";
import { CourseDetail } from "./components/CourseDetail";
import { CreateCourse } from "./components/CreateCourse";
import { ThemeToggle } from "./components/ThemeToggle";

interface Course {
	id: number;
	title: string;
	price: number;
	instructor: string;
	image: string;
}

function App() {
	const [view, setView] = useState<"landing" | "marketplace" | "create-course">(
		"landing"
	);
	const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
	const [theme, setTheme] = useState<"light" | "dark">("dark");

	// Load theme from local storage
	useEffect(() => {
		const savedTheme = localStorage.getItem("theme") as "light" | "dark";
		if (savedTheme) {
			setTheme(savedTheme);
		}
	}, []);

	// Save theme to local storage
	useEffect(() => {
		localStorage.setItem("theme", theme);
	}, [theme]);

	// Handle browser back button
	useEffect(() => {
		const handlePopState = () => {
			if (selectedCourse) {
				setSelectedCourse(null);
			} else if (view === "marketplace" || view === "create-course") {
				setView("landing");
			}
		};

		window.addEventListener("popstate", handlePopState);
		return () => window.removeEventListener("popstate", handlePopState);
	}, [view, selectedCourse]);

	const goToMarketplace = () => {
		window.history.pushState(null, "", "?page=marketplace");
		setView("marketplace");
	};

	const goToCreateCourse = () => {
		window.history.pushState(null, "", "?page=create-course");
		setView("create-course");
	};

	const goToCourseDetail = (course: Course) => {
		window.history.pushState(null, "", "?course=" + course.id);
		setSelectedCourse(course);
	};

	const toggleTheme = () => {
		setTheme((prev) => (prev === "dark" ? "light" : "dark"));
	};

	return (
		<Theme appearance={theme}>
			{/* Navbar */}
			<Flex
				position="sticky"
				px="4"
				py="2"
				justify="between"
				align="center"
				style={{
					borderBottom: "1px solid var(--gray-a2)",
					backgroundColor: "var(--color-background)",
					zIndex: 10,
					top: 0,
				}}
			>
				<Box>
					<Heading size="5">SuiAcademy</Heading>
				</Box>

				<Flex gap="3" align="center">
					<ThemeToggle currentTheme={theme} onToggle={toggleTheme} />
					<ConnectButton />
				</Flex>
			</Flex>

			{view === "landing" ? (
				/* Hero Section */
				<Container size="3" pt="8" pb="8" px="4">
					<Flex direction="column" align="center" gap="4" mb="8">
						<Heading size="9" align="center" style={{ fontWeight: 900 }}>
							Knowledge is Value
						</Heading>
						<Text size="5" color="gray" align="center" style={{ maxWidth: 600 }}>
							The decentralized marketplace for education. Learn from experts or
							monetize your knowledge on the Sui blockchain.
						</Text>
					</Flex>

					{/* The Two Big Cards */}
					<Grid columns={{ initial: "1", sm: "2" }} gap="6" width="auto">
						{/* Student Card */}
						<Card
							size="4"
							style={{
								cursor: "pointer",
								transition: "transform 0.2s",
							}}
							onMouseEnter={(e) =>
								(e.currentTarget.style.transform = "scale(1.02)")
							}
							onMouseLeave={(e) =>
								(e.currentTarget.style.transform = "scale(1)")
							}
							onClick={() => goToMarketplace()}
						>
							<Inset clip="padding-box" side="top" pb="current">
								<Flex
									height="150px"
									align="center"
									justify="center"
									style={{
										background:
											"linear-gradient(135deg, var(--iris-3), var(--iris-5))",
									}}
								>
									<Heading size="8" style={{ opacity: 0.8 }}>
										📖
									</Heading>
								</Flex>
							</Inset>
							<Flex direction="column" gap="3">
								<Heading size="6">I Want to Learn</Heading>
								<Text as="p" color="gray" size="3">
									Browse courses, master new skills, and pay seamlessly with SUI.
									Invest in yourself today.
								</Text>
								<Box mt="2">
									<Button size="3" variant="soft" style={{ width: "100%" }}>
										<Strong>Start Learning</Strong>
									</Button>
								</Box>
							</Flex>
						</Card>

						{/* Instructor Card */}
						<Card
							size="4"
							style={{
								cursor: "pointer",
								transition: "transform 0.2s",
							}}
							onMouseEnter={(e) =>
								(e.currentTarget.style.transform = "scale(1.02)")
							}
							onMouseLeave={(e) =>
								(e.currentTarget.style.transform = "scale(1)")
							}
							onClick={() => goToCreateCourse()}
						>
							<Inset clip="padding-box" side="top" pb="current">
								<Flex
									height="150px"
									align="center"
									justify="center"
									style={{
										background:
											"linear-gradient(135deg, var(--jade-3), var(--jade-5))",
									}}
								>
									<Heading size="8" style={{ opacity: 0.8 }}>
										👨‍🏫
									</Heading>
								</Flex>
							</Inset>
							<Flex direction="column" gap="3">
								<Heading size="6">I Want to Teach</Heading>
								<Text as="p" color="gray" size="3">
									Create courses, reach a global audience, and earn crypto directly
									to your wallet.
								</Text>
								<Box mt="2">
									<Button
										size="3"
										variant="soft"
										color="jade"
										style={{ width: "100%" }}
									>
										<Strong>Start Teaching</Strong>
									</Button>
								</Box>
							</Flex>
						</Card>
					</Grid>
				</Container>
			) : selectedCourse ? (
				<CourseDetail
					course={selectedCourse}
					onBack={() => window.history.back()}
				/>
			) : view === "create-course" ? (
				<CreateCourse onBack={() => window.history.back()} />
			) : (
				<Marketplace
					onBack={() => window.history.back()}
					onCourseSelect={(course) => goToCourseDetail(course)}
				/>
			)}
		</Theme>
	);
}

export default App;
