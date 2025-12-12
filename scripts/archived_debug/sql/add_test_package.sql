-- Add a 1 Euro Test Package for Live PayPal Testing
INSERT INTO public.credit_packages (name, price, credits, description)
VALUES 
('Test Paketi', 1.00, 1, 'Canlı ödeme testi için geçici paket');
