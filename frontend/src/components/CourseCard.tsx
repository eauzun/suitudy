import { Badge, Box, Button, Card, Flex, Heading, Inset, Text } from "@radix-ui/themes";

interface CourseCardProps {
	title: string;
	instructor: string;
	price: number;
	image: string;
}

export function CourseCard({ title, instructor, price, image }: CourseCardProps) {
	return (
		<Card size="2" style={{ transition: "transform 0.2s" }}>
			<Inset clip="padding-box" side="top" pb="current">
				<img
					src={image}
					alt={title}
					style={{
						display: "block",
						objectFit: "cover",
						width: "100%",
						height: 140,
						backgroundColor: "var(--gray-5)",
					}}
				/>
			</Inset>
			<Flex direction="column" gap="2">
				<Heading size="4">{title}</Heading>
				<Text size="2" color="gray">
					By {instructor.slice(0, 6)}...{instructor.slice(-4)}
				</Text>
				<Flex justify="between" align="center" mt="2">
					<Badge color="iris" size="2">
						{price} EP
					</Badge>
					<Button size="1" variant="soft">
						View
					</Button>
				</Flex>
			</Flex>
		</Card>
	);
}
