# ---------- Метод «Extract Function» ----------

# Приклад коду до рефакторингу
def process_payment(order):
    base_price = order['quantity'] * order['item_price']

    discount = 0.0
    if base_price > 1000:
        discount = base_price * 0.10

    print(f"Base Price: {base_price}")
    print(f"Discount: {discount}")
    print(f"Total: {(base_price - discount)}")

# Приклад коду після рефакторингу
def calculate_base_price(order):
    return order['quantity'] * order['item_price']

def calculate_discount(base_price):
    if base_price > 1000:
        return base_price * 0.10
    return 0.0

def process_payment(order):
    base_price = calculate_base_price(order)
    discount = calculate_discount(base_price)
    total = base_price - discount

    print(f"Base Price: {base_price}")
    print(f"Discount: {discount}")
    print(f"Total: {total}")

# ---------- Метод «Replace Conditional with Strategy» ----------

# Приклад коду до рефакторингу
def calculate_payment(amount, payment_method):
    if payment_method == 'credit_card':
        return amount * 1.03
    elif payment_method == 'paypal':
        return amount * 1.05
    else:
        raise ValueError("Unknown payment method")

# Приклад коду після рефакторингу
from abc import ABC, abstractmethod

class PaymentStrategy(ABC):
    @abstractmethod
    def calculate(self, amount): pass

class CreditCardStrategy(PaymentStrategy):
    def calculate(self, amount): return amount * 1.03

class PayPalStrategy(PaymentStrategy):
    def calculate(self, amount): return amount * 1.05

STRATEGIES = {
    'credit_card': CreditCardStrategy(),
    'paypal': PayPalStrategy(),
}

def calculate_payment(amount, payment_method):
    if payment_method not in STRATEGIES:
        raise ValueError("Unknown payment method")
    strategy = STRATEGIES[payment_method]
    return strategy.calculate(amount)

# ---------- Метод «Introduce Parameter Object» ----------

# Приклад коду до рефакторингу
def find_users(first_name, last_name):
    query = "SELECT * FROM users WHERE"
    filters = []

    if first_name:
        filters.append(f"first_name = '{first_name}'")
    if last_name:
        filters.append(f"last_name = '{last_name}'")

    if filters:
        query += " AND ".join(filters)
    
    print(f"Executing query: {query}")

find_users("John", "Smith")

# Приклад коду після рефакторингу
from dataclasses import dataclass

@dataclass
class UserSearchFilters:
    first_name: str | None = None
    last_name: str | None = None

def find_users(filters: UserSearchFilters):
    query = "SELECT * FROM users WHERE"
    query_filters = []

    if filters.first_name:
        query_filters.append(f"first_name = '{filters.first_name}'")
    if filters.last_name:
        query_filters.append(f"last_name = '{filters.last_name}'")

    if query_filters:
        query += " AND ".join(query_filters)

    print(f"Executing query: {query}")

filters = UserSearchFilters(first_name="John", last_name="Smith")
find_users(filters)

# ---------- Комплексний рефакторинг ----------

# Приклад коду до рефакторингу
def register_user(username, password, password_confirm, email):
    
    if password != password_confirm:
        print("Error: Passwords do not match")
        return False
    
    if "@" not in email:
        print("Error: Invalid email")
        return False

    user = {
        'username': username, 
        'email': email, 
    }
    print(f"User {username} created in database.")
    
    return True

# Приклад коду після рефакторингу
from dataclasses import dataclass

@dataclass
class UserRegistrationData:
    username: str
    email: str

def _validate_user(data: UserRegistrationData, password, password_confirm):
    if password != password_confirm:
        raise ValueError("Passwords do not match")
    if "@" not in data.email:
        raise ValueError("Invalid email")

def _create_user(data: UserRegistrationData):
    user = {
        'username': data.username, 
        'email': data.email, 
    }
    print(f"User {data.username} created in database.")
    return user

def register_user(data: UserRegistrationData, password, password_confirm):
    try:
        _validate_user(data, password, password_confirm)
        user = _create_user(data)
        return True
    except ValueError as e:
        print(f"Error: {e}")
        return False
