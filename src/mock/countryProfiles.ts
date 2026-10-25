/** Locale details used to generate believable mock employees per country. */
export interface CountryProfile {
  firstNames: string[]
  lastNames: string[]
  cities: string[]
  streets: string[]
  phonePrefix: string
}

export const COUNTRY_PROFILES: Record<string, CountryProfile> = {
  Australia: {
    firstNames: ['Olivia', 'Jack', 'Charlotte', 'Liam', 'Matilda', 'Noah', 'Isla', 'Cooper', 'Ruby', 'Oscar', 'Mia', 'Lachlan', 'Zoe', 'Hamish', 'Grace', 'Archie', 'Chloe', 'Riley'],
    lastNames: ['Smith', 'Nguyen', 'Taylor', 'Brown', 'Wilson', 'Kelly', 'Martin', 'Walker', 'White', 'Harris', 'Lee', 'Ryan', 'Clarke', 'Murphy'],
    cities: ['Sydney NSW', 'Melbourne VIC', 'Brisbane QLD', 'Perth WA'],
    streets: ['George Street', 'Collins Street', 'Queen Street', 'Hay Street'],
    phonePrefix: '+61 4',
  },
  Brazil: {
    firstNames: ['Lucas', 'Ana', 'Gabriel', 'Beatriz', 'Rafael', 'Mariana', 'Thiago', 'Larissa', 'Pedro', 'Juliana', 'Mateus', 'Camila', 'Felipe', 'Isabela', 'Bruno', 'Fernanda', 'Diego', 'Letícia'],
    lastNames: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Costa', 'Pereira', 'Almeida', 'Ferreira', 'Rodrigues', 'Lima', 'Gomes', 'Ribeiro', 'Carvalho', 'Barbosa'],
    cities: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba'],
    streets: ['Avenida Paulista', 'Rua Augusta', 'Rua da Consolação', 'Avenida Atlântica'],
    phonePrefix: '+55 11',
  },
  Canada: {
    firstNames: ['Emma', 'Ethan', 'Chloé', 'Owen', 'Maya', 'Logan', 'Sophie', 'Félix', 'Noah', 'Olivia', 'Liam', 'Ava', 'William', 'Charlotte', 'Benjamin', 'Léa', 'Jacob', 'Amélia'],
    lastNames: ['Tremblay', 'Roy', 'MacDonald', 'Campbell', 'Gagnon', 'Wong', 'Singh', 'Côté', 'Bouchard', 'Morin', 'Lavoie', 'Fortin', 'Chen', 'Thompson'],
    cities: ['Toronto ON', 'Vancouver BC', 'Montréal QC', 'Calgary AB'],
    streets: ['King Street West', 'Robson Street', 'Rue Sainte-Catherine', 'Stephen Avenue'],
    phonePrefix: '+1 416',
  },
  Germany: {
    firstNames: ['Lukas', 'Mia', 'Leon', 'Hannah', 'Felix', 'Lea', 'Jonas', 'Lena', 'Paul', 'Emma', 'Maximilian', 'Sophie', 'Ben', 'Marie', 'Elias', 'Laura', 'Noah', 'Anna'],
    lastNames: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Wagner', 'Becker', 'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf'],
    cities: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt am Main'],
    streets: ['Friedrichstraße', 'Leopoldstraße', 'Mönckebergstraße', 'Zeil'],
    phonePrefix: '+49 151',
  },
  India: {
    firstNames: ['Aarav', 'Priya', 'Rohan', 'Ananya', 'Vikram', 'Sneha', 'Arjun', 'Kavya', 'Rahul', 'Ishita', 'Aditya', 'Pooja', 'Siddharth', 'Neha', 'Karan', 'Meera', 'Nikhil', 'Riya', 'Varun', 'Divya'],
    lastNames: ['Sharma', 'Patel', 'Iyer', 'Reddy', 'Kulkarni', 'Gupta', 'Nair', 'Deshmukh', 'Joshi', 'Menon', 'Bhat', 'Chatterjee', 'Rao', 'Agarwal', 'Pillai'],
    cities: ['Pune', 'Bengaluru', 'Mumbai', 'Hyderabad', 'Chennai'],
    streets: ['MG Road', 'FC Road', 'Linking Road', 'Banjara Hills Road', 'Anna Salai'],
    phonePrefix: '+91 98',
  },
  Japan: {
    firstNames: ['Haruto', 'Yui', 'Sota', 'Aoi', 'Ren', 'Hina', 'Daiki', 'Sakura', 'Yuto', 'Mio', 'Kaito', 'Rin', 'Takumi', 'Yuna', 'Riku', 'Akari', 'Kenta', 'Hana'],
    lastNames: ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato', 'Yoshida', 'Yamada', 'Sasaki', 'Matsumoto'],
    cities: ['Tokyo', 'Osaka', 'Yokohama', 'Fukuoka'],
    streets: ['Chuo-dori', 'Midosuji', 'Minatomirai-dori', 'Tenjin-nishi-dori'],
    phonePrefix: '+81 90',
  },
  Netherlands: {
    firstNames: ['Daan', 'Emma', 'Sem', 'Julia', 'Lucas', 'Tess', 'Bram', 'Sanne', 'Finn', 'Sophie', 'Lars', 'Eva', 'Thijs', 'Lotte', 'Ruben', 'Fleur', 'Jesse', 'Noor'],
    lastNames: ['de Jong', 'Jansen', 'de Vries', 'van den Berg', 'Bakker', 'Visser', 'Smit', 'Meijer', 'de Boer', 'Mulder', 'de Groot', 'Bos', 'Vos', 'Peters'],
    cities: ['Amsterdam', 'Rotterdam', 'Utrecht', 'Eindhoven'],
    streets: ['Prinsengracht', 'Coolsingel', 'Oudegracht', 'Stratumseind'],
    phonePrefix: '+31 6',
  },
  Singapore: {
    firstNames: ['Wei Ling', 'Jun Hao', 'Siti', 'Arun', 'Mei Xin', 'Darren', 'Nur Aisyah', 'Ravi', 'Kai Xuan', 'Hui Min', 'Farhan', 'Priya', 'Jia Hui', 'Marcus', 'Aisyah', 'Ethan', 'Xin Yi', 'Hafiz'],
    lastNames: ['Tan', 'Lim', 'Lee', 'Ng', 'Wong', 'Rahman', 'Pillai', 'Chua', 'Goh', 'Teo', 'Koh', 'Ong', 'Ismail', 'Nair'],
    cities: ['Singapore'],
    streets: ['Orchard Road', 'Robinson Road', 'Tampines Avenue', 'Jurong West Street'],
    phonePrefix: '+65 9',
  },
  'United Kingdom': {
    firstNames: ['Oliver', 'Amelia', 'George', 'Isla', 'Harry', 'Ava', 'Arthur', 'Freya', 'Jack', 'Olivia', 'Charlie', 'Emily', 'Thomas', 'Sophie', 'Leo', 'Poppy', 'Alfie', 'Ella'],
    lastNames: ['Smith', 'Jones', 'Williams', 'Davies', 'Evans', 'Patel', 'Hughes', 'Taylor', 'Brown', 'Wilson', 'Johnson', 'Wright', 'Walker', 'Roberts'],
    cities: ['London', 'Manchester', 'Edinburgh', 'Bristol'],
    streets: ['Baker Street', 'Deansgate', 'Princes Street', 'Park Street'],
    phonePrefix: '+44 7700',
  },
  'United States': {
    firstNames: ['James', 'Sophia', 'Michael', 'Emily', 'Daniel', 'Madison', 'Carlos', 'Aisha', 'Ethan', 'Olivia', 'Mason', 'Ava', 'Lucas', 'Mia', 'Jacob', 'Harper', 'Andre', 'Grace'],
    lastNames: ['Johnson', 'Williams', 'Garcia', 'Miller', 'Rodriguez', 'Anderson', 'Thompson', 'Martinez', 'Davis', 'Lopez', 'Wilson', 'Moore', 'Jackson', 'Lee'],
    cities: ['New York, NY', 'Austin, TX', 'Seattle, WA', 'Chicago, IL'],
    streets: ['Madison Avenue', 'Congress Avenue', 'Pine Street', 'Michigan Avenue'],
    phonePrefix: '+1 512',
  },
}
