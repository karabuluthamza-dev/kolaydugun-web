-- Ensure profile exists and set role to admin using the specific ID found
INSERT INTO profiles (id, role, email)
VALUES ('13e2508f-e520-4bb3-bd3d-e1f4eee59024', 'admin', 'karabulut.hamza@gmail.com')
ON CONFLICT (id) DO UPDATE
SET role = 'admin';

-- Verify the update
SELECT * FROM profiles WHERE id = '13e2508f-e520-4bb3-bd3d-e1f4eee59024';
