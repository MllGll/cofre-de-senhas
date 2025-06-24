import { EyeIcon, EyeOffIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
	({ className, type, ...props }, ref) => {
		const [showPassword, setShowPassword] = React.useState(false);
		const Icon = showPassword ? EyeOffIcon : EyeIcon;

		return (
			<div className="relative">
				<input
					type={
						type === "password" ? (showPassword ? "text" : "password") : type
					}
					className={cn(
						"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
						className,
					)}
					ref={ref}
					{...props}
				/>
				{type === "password" && (
					<button
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						className="absolute top-1/2 right-3 -translate-y-1/2"
					>
						<Icon className=" size-5" />
					</button>
				)}
			</div>
		);
	},
);
Input.displayName = "Input";

export { Input };
