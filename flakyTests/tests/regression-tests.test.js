/**
 * Regression Test Suite
 * Tests that should always fail - to demonstrate TeamCity can distinguish
 * between flaky tests and genuine failures
 */

describe('Genuine Failures - Bug Regression Tests', () => {
  test('REGRESSION: calculation bug in invoice total', () => {
    // Simulating a real bug in calculation logic
    const calculateInvoiceTotal = (items) => {
      // Bug: forgot to multiply quantity
      return items.reduce((total, item) => total + item.price, 0);
    };
    
    const items = [
      { price: 10, quantity: 2 },
      { price: 15, quantity: 3 },
      { price: 5, quantity: 1 }
    ];
    
    // This should be 70 (20 + 45 + 5) but our buggy function returns 30
    const total = calculateInvoiceTotal(items);
    expect(total).toBe(70); // This will always fail due to the bug
  });

  test('REGRESSION: null pointer in user service', () => {
    // Simulating a null pointer bug
    const getUserFullName = (user) => {
      // Bug: not checking if names exist
      return user.firstName + ' ' + user.lastName;
    };
    
    const user = { id: 1 }; // Missing firstName and lastName
    
    // This will always fail with undefined concatenation
    expect(() => {
      const fullName = getUserFullName(user);
      expect(fullName).toBe('John Doe');
    }).not.toThrow(); // We expect it not to throw, but it will
  });

  test('REGRESSION: array index out of bounds', () => {
    // Simulating an array index bug
    const getThirdElement = (arr) => {
      // Bug: not checking array length
      return arr[2];
    };
    
    const shortArray = [1, 2]; // Only 2 elements
    const result = getThirdElement(shortArray);
    
    // This will always fail as result is undefined
    expect(result).toBe(3);
  });

  test('REGRESSION: incorrect date formatting', () => {
    // Simulating a date formatting bug
    const formatDate = (date) => {
      // Bug: using getMonth() which returns 0-11, forgot to add 1
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    };
    
    const testDate = new Date('2024-03-15');
    const formatted = formatDate(testDate);
    
    // This will always fail - returns "2024-2-15" instead of "2024-3-15"
    expect(formatted).toBe('2024-3-15');
  });

  test('REGRESSION: async operation never completes', () => {
    // Simulating a hanging promise bug
    const fetchUserData = () => {
      return new Promise((resolve) => {
        // Bug: forgot to call resolve
        setTimeout(() => {
          // Missing: resolve(data);
        }, 100);
      });
    };
    
    // This will timeout and fail
    return expect(fetchUserData()).resolves.toEqual({ id: 1, name: 'Test User' });
  });
});

describe('Genuine Failures - Business Logic Errors', () => {
  test('FAILED: discount calculation exceeds maximum allowed', () => {
    const calculateDiscount = (price, discountPercent) => {
      // Business rule: max discount is 50%
      // Bug: not enforcing the rule
      return price * (discountPercent / 100);
    };
    
    const price = 100;
    const discount = calculateDiscount(price, 75); // 75% discount
    
    // This should fail - discount should be capped at 50
    expect(discount).toBeLessThanOrEqual(50);
  });

  test('FAILED: password validation missing special character check', () => {
    const isValidPassword = (password) => {
      // Bug: forgot to check for special characters
      return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
    };
    
    // This password has no special characters but function returns true
    const password = 'Password123';
    
    // We expect this to fail for passwords without special chars
    expect(isValidPassword(password)).toBe(false);
  });

  test('FAILED: age verification allows minors', () => {
    const canPurchaseAlcohol = (birthDate) => {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      
      // Bug: not checking month and day properly
      return age >= 21;
    };
    
    // Person who just turned 20 today
    const today = new Date();
    const birthDate = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate());
    
    // This should fail - person is only 20
    expect(canPurchaseAlcohol(birthDate)).toBe(false);
  });
});

describe('Genuine Failures - Integration Errors', () => {
  test('FAILED: API response parsing error', () => {
    const parseAPIResponse = (response) => {
      // Bug: assuming response.data exists
      return response.data.items.map(item => item.id);
    };
    
    const malformedResponse = { 
      error: 'No data available',
      status: 200 
    };
    
    // This will always fail - no data property
    expect(() => parseAPIResponse(malformedResponse)).not.toThrow();
  });

  test('FAILED: database connection string malformed', () => {
    const buildConnectionString = (config) => {
      // Bug: wrong format for connection string
      return `mongodb://${config.host}/${config.port}/${config.database}`;
    };
    
    const config = {
      host: 'localhost',
      port: 27017,
      database: 'testdb'
    };
    
    // This will fail - format should be host:port/database not host/port/database
    const connectionString = buildConnectionString(config);
    expect(connectionString).toBe('mongodb://localhost:27017/testdb');
  });
});
