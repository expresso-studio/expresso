#!/bin/bash

COMPONENTS_DIR="./components"
TEST_DIR="./__tests__"

for file in $COMPONENTS_DIR/*.tsx; do
    filename=$(basename -- "$file")
    name="${filename%.*}"
    test_file="$TESTS_DIR/${name}.test.tsx"

    if [ ! -f "$test_file" ]; then
        echo "Generating test file for $name..."
        cat <<EOL > "$test_file"
import { render, screen } from "@testing-library/react";
import $name from "../components/$name";

describe("$name Component", () => {
    test("renders without crashing", () => {
        render(<$name />);
        expect(screen.getByText(/./)).toBeInTheDocument();
    });
});
EOL
    fi
done
