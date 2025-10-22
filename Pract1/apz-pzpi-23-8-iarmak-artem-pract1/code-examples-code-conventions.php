// ---------- 1.2.2  Структура коду ----------

// Погано
<?php
use MyProject\Services\UserService;

namespace MyProject\Controllers;
use MyProject\Exceptions\UserNotFoundException;

class UserController { /* ... */ }
?>

// Добре
<?php

namespace MyProject\Controllers;

use MyProject\Exceptions\UserNotFoundException;
use MyProject\Services\UserService;

class UserController
{
    // ...
}

// ---------- 1.2.3 Форматування коду ----------

// Погано
class User
{
	function update( $data )
	{
		if($data['name']!=null)
		{
			$this->name=$data['name'];
		}
		else
		{
			return false;
		}
	}
}

// Добре
class User
{
    public function update(array $data): bool
    {
        if ($data['name'] !== null) { 
            $this->name = $data['name'];
        } else {
            return false;
        }

        return true;
    }
}

// ---------- 1.2.4 Іменування ----------

// Погано
class user_manager {
    const default_role = 'guest';
    public $UserName;
    
    function Process_Data(array $DATA) {
        $IS_VALID = TRUE;
        // ...
    }
}

// Добре
class UserManager
{
    public const DEFAULT_ROLE = 'guest';
    public string $userName; 
    
    public function processData(array $data): void
    {
        $isValid = true;
        // ...
    }
}

// ---------- 1.2.5 Коментарі ----------

// Погано
class DataProcessor
{
    // Функція для обробки
    public function process($data)
    {
        // $oldResult = $data->processOld();
        $result = $data->process(); // Отримуємо результат

        if ($result > 10) { // Якщо результат більше 10
            return true; // Повернути true
        }
    }
}

// Добре
class UserReportGenerator
{
    // TODO: Перенести логіку в окремий сервіс ReportBuilder
    public function generate(User $user): Report
    {
        // Облікові записи гостей не мають розширених звітів,
        // щоб уникнути навантаження на БД.
        if ($user->isGuest()) {
            return Report::createEmpty($user);
        }

        $reportData = $this->fetchDataForUser($user);

        return Report::createFromData($reportData);
    }
}

// ---------- 1.2.6 Документування коду ----------

/**
 * Отримує користувача з бази даних за його ID.
 *
 * @param int $userId ID користувача, якого потрібно знайти.
 *
 * @return User Повертає об'єкт User.
 * @throws UserNotFoundException Якщо користувача з таким ID не знайдено.
 */
public function getUserById(int $userId): User
{
    $user = $this->repository->find($userId);

    if ($user === null) {
        throw new UserNotFoundException('User not found');
    }
    
    return $user;
}

// ---------- 1.2.7 Конвенції стилю кодування для PHP ----------

// Погано
class User
{
    var $name;

    function getProfile()
    {
        // ...
    }
}

// Добре
class User
{
    public string $name;

    public function getProfile(): array
    {
        // ...
    }
}

// Погано
if ($a > 10) {
    // ...
}
else if ($a > 5) {
    // ...
}
else
{
    // ...
}

// Добре
if ($a > 10) {
    // ...
} elseif ($a > 5) {
    // ...
} else {
    // ...
}

// Погано
public function findUser(int $id): ? User
{
    // ...
}

// Добре
public function findUser(int $id): ?User
{
    // ...
}

// ---------- 1.2.8 Кодування на основі тестування ----------

namespace Tests\Unit;

use App\Calculator;
use PHPUnit\Framework\TestCase;

class CalculatorTest extends TestCase
{
    @return void

    public function testAddsTwoNumbers(): void
    {
        $calculator = new Calculator();
        
        $result = $calculator->add(5, 10);
        
        $this->assertEquals(15, $result);
    }
}

// ---------- 1.2.10 Приклади оформлення коду: аналіз та обговорення ----------

// Погано
<?php
class user_controller {
	var $db;
	function __construct($DB) { 
		$this->db=$DB;
	}
	
	public function GetUser($id)
	{
		if($id < 1){ return NULL; }
		$data = $this->db->query("SELECT * FROM users WHERE id = " . $id);
		return $data;
	}
}
?>

// Добре
<?php

namespace App\Controllers;

use App\Database\Connection;
use App\Models\User;

class UserController
{
    private Connection $db;
    
    public function __construct(Connection $db)
    {
        $this->db = $db;
    }

    public function getUser(int $id): ?User 
    {
        if ($id < 1) { 
            return null; 
        }
        
        $data = $this->db->findUser($id);
        
        return $data ? new User($data) : null;
    }
}
