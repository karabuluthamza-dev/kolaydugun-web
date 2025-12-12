INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ghost1@example.com', '$2a$10$hashedpasswordplaceholder', now(), null, now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Elif","last_name":"Yılmaz"}', now(), now(), '', '', '', ''),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ghost2@example.com', '$2a$10$hashedpasswordplaceholder', now(), null, now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Zeynep","last_name":"Kaya"}', now(), now(), '', '', '', ''),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ghost3@example.com', '$2a$10$hashedpasswordplaceholder', now(), null, now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Ayşe","last_name":"Demir"}', now(), now(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, first_name, last_name, is_bot, role)
VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Elif', 'Yılmaz', true, 'user'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Zeynep', 'Kaya', true, 'user'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Ayşe', 'Demir', true, 'user')
ON CONFLICT (id) DO NOTHING;
