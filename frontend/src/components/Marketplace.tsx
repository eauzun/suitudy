import { Button, Container, Flex, Grid, Heading, Box } from "@radix-ui/themes";
import { CourseCard } from "./CourseCard";

interface Course {
	id: number;
	title: string;
	price: number;
	instructor: string;
	image: string;
}

interface MarketplaceProps {
	onBack: () => void;
	onCourseSelect: (course: Course) => void;
}

const MOCK_COURSES = [
	{
		id: 1,
		title: "Intro to Sui Move",
		price: 50,
		instructor: "0x1234567890abcdef1234567890abcdef",
		image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
	},
	{
		id: 2,
		title: "Advanced React Patterns",
		price: 120,
		instructor: "0xabcdef1234567890abcdef12345678",
		image: "https://images.unsplash.com/photo-1633356122102-3fe601e1570f?w=800&q=80",
	},
	{
		id: 3,
		title: "DeFi Fundamentals",
		price: 80,
		instructor: "0x7890abcdef1234567890abcdef1234",
		image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&q=80",
	},
	{
		id: 4,
		title: "Rust for Blockchain",
		price: 150,
		instructor: "0x4567890abcdef1234567890abcdef1",
		image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80",
	},
	{
		id: 5,
		title: "Web3 Security 101",
		price: 200,
		instructor: "0xdef1234567890abcdef1234567890a",
		image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80",
	},
	{
		id: 6,
		title: "NFT Art Masterclass",
		price: 90,
		instructor: "0x90abcdef1234567890abcdef123456",
		image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80",
	},
];

export function Marketplace({ onBack, onCourseSelect }: MarketplaceProps) {
	return (
		<Container size="4" p="4">
			<Flex justify="between" align="center" mb="6">
				<Heading size="6">Explore Courses</Heading>
				<Button variant="ghost" onClick={onBack}>
					← Back to Home
				</Button>
			</Flex>

			<Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
				{MOCK_COURSES.map((course) => (
					<Box
						key={course.id}
						onClick={() => onCourseSelect(course)}
						style={{ cursor: "pointer" }}
					>
						<CourseCard
							title={course.title}
							instructor={course.instructor}
							price={course.price}
							image={course.image}
						/>
					</Box>
				))}
			</Grid>
		</Container>
	);
}
