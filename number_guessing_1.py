import random

def number_guessing_game():
    print("Welcome to the Number Guessing Game!")
    best_score = None

    while True:
        print("Choose difficulty level:")
        print("1. Easy (1-10)")
        print("2. Medium (1-50)")
        print("3. Hard (1-100)")

        difficulty = input("Enter 1, 2, or 3: ")
        if difficulty == '1':
            max_number = 10
        elif difficulty == '2':
            max_number = 50
        elif difficulty == '3':
            max_number = 100
        else:
            print("Invalid choice, defaulting to Easy.")
            max_number = 10

        secret_number = random.randint(1, max_number)
        attempts = 0

        print(f"I'm thinking of a number between 1 and {max_number}. Try to guess it!")

        while True:
            try:
                guess = int(input("Your guess: "))
                attempts += 1
                if guess < secret_number:
                    print("Higher!")
                elif guess > secret_number:
                    print("Lower!")
                else:
                    print(f"Congratulations! You guessed the number in {attempts} attempts.")
                    if best_score is None or attempts < best_score:
                        best_score = attempts
                        print(f"New best score: {best_score} attempts!")
                    break
            except ValueError:
                print("Please enter a valid integer.")

        replay = input("Do you want to play again? (yes/no): ").lower()
        if replay != 'yes':
            print("Thanks for playing! Goodbye.")
            break

if __name__ == '__main__':
    number_guessing_game()
