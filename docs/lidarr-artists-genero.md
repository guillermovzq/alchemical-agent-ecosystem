# Artistas y bandas con género (para import automático a Lidarr)

Tabla plana de **artista + género**, pensada para que un script (p. ej. corriendo en tu TNAS) la parsee línea por línea y dé de alta cada artista en Lidarr vía su API (`POST /api/v1/artist/lookup?term=<nombre>` seguido de `POST /api/v1/artist` con el resultado elegido, usando tu `apiKey` de Lidarr).

Es la misma curación que [`LIDARR_LISTA_MUSICAL.md`](./LIDARR_LISTA_MUSICAL.md) (con país y época), aplanada a dos columnas para que sea trivial de parsear. Formato: una fila de tabla Markdown por artista, `| Artista | Género |`. Sin encabezados de sección intercalados, así que cualquier parser de Markdown/CSV simple (dividir cada línea por `|`) funciona sin casos especiales.

| Artista | Género |
|---|---|
| Johann Sebastian Bach | Clásica |
| Antonio Vivaldi | Clásica |
| George Frideric Handel | Clásica |
| Joseph Haydn | Clásica |
| Wolfgang Amadeus Mozart | Clásica |
| Ludwig van Beethoven | Clásica |
| Franz Schubert | Clásica |
| Franz Liszt | Clásica |
| Frédéric Chopin | Clásica |
| Richard Wagner | Clásica |
| Giuseppe Verdi | Clásica |
| Johannes Brahms | Clásica |
| Johann Strauss II | Clásica |
| Camille Saint-Saëns | Clásica |
| Edvard Grieg | Clásica |
| Pyotr Ilyich Tchaikovsky | Clásica |
| Sergei Rachmaninoff | Clásica |
| Claude Debussy | Clásica |
| Enrico Caruso | Ópera |
| Beniamino Gigli | Ópera |
| Jussi Björling | Ópera |
| Luciano Pavarotti | Ópera |
| Joan Sutherland | Ópera |
| Maria Callas | Ópera |
| Montserrat Caballé | Ópera |
| Plácido Domingo | Ópera |
| Kiri Te Kanawa | Ópera |
| Cecilia Bartoli | Ópera |
| Andrea Bocelli | Ópera |
| Renée Fleming | Ópera |
| Jelly Roll Morton | Jazz |
| Louis Armstrong | Jazz |
| Billie Holiday | Jazz |
| Dizzy Gillespie | Jazz |
| Charlie Parker | Jazz |
| Thelonious Monk | Jazz |
| Sarah Vaughan | Jazz |
| Ella Fitzgerald | Jazz |
| Miles Davis | Jazz |
| John Coltrane | Jazz |
| Chet Baker | Jazz |
| Nina Simone | Jazz |
| Charles Mingus | Jazz |
| Bill Evans | Jazz |
| Art Blakey | Jazz |
| Wes Montgomery | Jazz |
| Herbie Hancock | Jazz |
| Scott Hamilton | Jazz |
| Prince Buster | Reggae |
| Desmond Dekker | Reggae |
| Lee "Scratch" Perry | Reggae |
| Bob Marley | Reggae |
| Peter Tosh | Reggae |
| Jimmy Cliff | Reggae |
| Toots and the Maytals | Reggae |
| Burning Spear | Reggae |
| Gregory Isaacs | Reggae |
| Black Uhuru | Reggae |
| Gang Starr | Hip-hop |
| De La Soul | Hip-hop |
| A Tribe Called Quest | Hip-hop |
| Outkast | Hip-hop |
| Nas | Hip-hop |
| Mos Def (Yasiin Bey) | Hip-hop |
| Talib Kweli | Hip-hop |
| Common | Hip-hop |
| J Dilla | Hip-hop |
| Lauryn Hill | Hip-hop |
| Kendrick Lamar | Hip-hop |
| Skai Isyourgod | Hip-hop |
| The Notorious B.I.G. | Hip-hop |
| Eminem | Hip-hop |
| The Stooges | Punk |
| Patti Smith | Punk |
| The Clash | Punk |
| Sex Pistols | Punk |
| Wire | Punk |
| Sham 69 | Punk |
| Buzzcocks | Punk |
| Ramones | Punk |
| Dead Kennedys | Punk |
| Bad Religion | Punk |
| The Beatles | Rock |
| The Rolling Stones | Rock |
| The Who | Rock |
| Jimi Hendrix Experience | Rock |
| David Bowie | Rock |
| Led Zeppelin | Rock |
| Pink Floyd | Rock |
| Queen | Rock |
| Radiohead | Rock |
| Charly García | Rock |
| Soda Stereo | Rock |
| Gustavo Cerati | Rock |
| Fito Páez | Rock |
| Café Tacuba | Rock |
| Caifanes | Rock |
| Zoé | Rock |
| Héroes del Silencio | Rock |
| Nirvana | Grunge |
| Pearl Jam | Grunge |
| Soundgarden | Grunge |
| Alice in Chains | Grunge |
| Stone Temple Pilots | Grunge |
| The Smiths | Indie |
| Pixies | Indie |
| Sonic Youth | Indie |
| Belle and Sebastian | Indie |
| Arcade Fire | Indie |
| The National | Indie |
| Arctic Monkeys | Indie |
| Vampire Weekend | Indie |
| Woody Guthrie | Folk |
| Joan Baez | Folk |
| Bob Dylan | Folk |
| Simon & Garfunkel | Folk |
| Nick Drake | Folk |
| Fairport Convention | Folk |
| Joni Mitchell | Folk |
| Leonard Cohen | Folk |
| James Brown | Funk |
| Sly and the Family Stone | Funk |
| Parliament-Funkadelic | Funk |
| Kool & the Gang | Funk |
| Rick James | Funk |
| Bootsy Collins | Funk |
| Tower of Power | Funk |
| Helloween | Power metal |
| Gamma Ray | Power metal |
| Edguy | Power metal |
| Blind Guardian | Power metal |
| Stratovarius | Power metal |
| Nightwish | Power metal |
| Rhapsody of Fire | Power metal |
| Sabaton | Power metal |
| Kamelot | Power metal |
| DragonForce | Power metal |
| Black Sabbath | Metal |
| Judas Priest | Metal |
| Motörhead | Metal |
| Iron Maiden | Metal |
| Dio | Metal |
| Metallica | Metal |
| Slayer | Metal |
| Megadeth | Metal |
| Pantera | Metal |
| Death | Metal |
| Opeth | Metal |
| Sepultura | Metal |
| Los Cadetes de Linares | Corridos tradicionales |
| Pedro Infante | Corridos tradicionales |
| José Alfredo Jiménez | Corridos tradicionales |
| Miguel Aceves Mejía | Corridos tradicionales |
| Flor Silvestre | Corridos tradicionales |
| Vicente Fernández | Corridos tradicionales |
| Los Alegres de Terán | Corridos tradicionales |
| Lorenzo de Monteclaro | Corridos tradicionales |
| The Skatalites | Ska |
| Prince Buster | Ska |
| The Specials | Ska |
| Madness | Ska |
| The Selecter | Ska |
| The English Beat | Ska |
| Operation Ivy | Ska |
| Fishbone | Ska |
| Mano Negra | Ska |
| Los Fabulosos Cadillacs | Ska |
| Roberto Carlos | Balada |
| Luis Miguel | Balada |
| José José | Balada |
| Armando Manzanero | Balada |
| Marco Antonio Solís | Balada |
| Ana Gabriel | Balada |
| Julio Iglesias | Balada |
| Camilo Sesto | Balada |
| Nino Bravo | Balada |
| Raphael | Balada |
| Rocío Dúrcal | Balada |
| José Luis Perales | Balada |
| Mocedades | Balada |
| Sandro | Balada |
| Michael Jackson | Pop |
| Prince | Pop |
| Stevie Wonder | Pop |
| Lionel Richie | Pop |
| Whitney Houston | Pop |
| George Michael | Pop |
| Elton John | Pop |
| Sting | Pop |
| Peter Gabriel | Pop |
| Eurythmics | Pop |
| Sade | Pop |
| Björk | Pop |
| ABBA | Pop |
| Miguel Bosé | Pop |
| Madonna | Pop |
| Cher | Pop |
| Ed Sheeran | Pop |
| Nelson Cavaquinho | Samba |
| Cartola | Samba |
| Paulinho da Viola | Samba |
| Clara Nunes | Samba |
| Alcione | Samba |
| Jorge Aragão | Samba |
| Beth Carvalho | Samba |
| Martinho da Vila | Samba |
| Zeca Pagodinho | Samba |
| Elza Soares | Samba |
| Diana Ross | Disco |
| Donna Summer | Disco |
| Sister Sledge | Disco |
| KC and the Sunshine Band | Disco |
| The Trammps | Disco |
| Village People | Disco |
| Chic | Disco |
| Earth, Wind & Fire | Disco |
| Gloria Gaynor | Disco |
| Bee Gees | Disco |
| Frankie Knuckles | House |
| Marshall Jefferson | House |
| Derrick May | House |
| Kevin Saunderson | House |
| Larry Heard | House |
| Robert Hood | House |
| Carl Craig | House |
| Daft Punk | House |
| Axwell | House |
| Steve Angello | House |
| Sebastian Ingrosso | House |
| Avicii | House |
| Eric Prydz | House |
| Carlos Gardel | Tango |
| Edmundo Rivero | Tango |
| Aníbal Troilo | Tango |
| Roberto Goyeneche | Tango |
| Osvaldo Pugliese | Tango |
| Julio Sosa | Tango |
| Astor Piazzolla | Tango |
| Susana Rinaldi | Tango |
| João Gilberto | Bossa nova |
| Antônio Carlos Jobim | Bossa nova |
| Vinícius de Moraes | Bossa nova |
| Astrud Gilberto | Bossa nova |
| Elis Regina | Bossa nova |
| Nara Leão | Bossa nova |
| Baden Powell | Bossa nova |
| Luiz Bonfá | Bossa nova |
| Sérgio Mendes | Bossa nova |
| Stan Getz | Bossa nova |
| Tatsuro Yamashita | City pop |
| Mariya Takeuchi | City pop |
| Miki Matsubara | City pop |
| Anri | City pop |
| Toshiki Kadomatsu | City pop |
| Junko Ohashi | City pop |
| Seo Taiji and Boys | K-pop |
| BoA | K-pop |
| Epik High | K-pop |
| IU | K-pop |
| DEAN | K-pop |
| Crush | K-pop |
| PSY | K-pop |
| Teresa Teng | Cantopop / Mandopop |
| Cui Jian | Cantopop / Mandopop |
| Anita Mui | Cantopop / Mandopop |
| Leslie Cheung | Cantopop / Mandopop |
| Faye Wong | Cantopop / Mandopop |
| Sinn Sisamouth | Música del sudeste asiático |
| Trịnh Công Sơn | Música del sudeste asiático |
| Khánh Ly | Música del sudeste asiático |
| Carabao | Música del sudeste asiático |
| Chrisye | Música del sudeste asiático |
| Iwan Fals | Música del sudeste asiático |
| Freddie Aguilar | Música del sudeste asiático |
| Lea Salonga | Música del sudeste asiático |
| Duke Ellington | Big band |
| Cab Calloway | Big band |
| Count Basie | Big band |
| Benny Goodman | Big band |
| Artie Shaw | Big band |
| Tommy Dorsey | Big band |
| Glenn Miller | Big band |
| Woody Herman | Big band |
| Louis Prima | Big band |
| Frank Sinatra | Big band |
| La Niña de los Peines | Flamenco |
| Manolo Caracol | Flamenco |
| Camarón de la Isla | Flamenco |
| Paco de Lucía | Flamenco |
| Enrique Morente | Flamenco |
| Tomatito | Flamenco |
| Diego El Cigala | Flamenco |
| Vicente Amigo | Flamenco |
| Estrella Morente | Flamenco |
| Niña Pastori | Flamenco |
| Hank Williams | Country |
| Patsy Cline | Country |
| George Jones | Country |
| Loretta Lynn | Country |
| Merle Haggard | Country |
| Waylon Jennings | Country |
| Johnny Cash | Country |
| Willie Nelson | Country |
| Emmylou Harris | Country |
| Dolly Parton | Country |
| Bessie Smith | Blues |
| Skip James | Blues |
| Robert Johnson | Blues |
| Muddy Waters | Blues |
| Howlin' Wolf | Blues |
| T-Bone Walker | Blues |
| Elmore James | Blues |
| John Lee Hooker | Blues |
| Albert King | Blues |
| Freddie King | Blues |
| B.B. King | Blues |
| Etta James | Blues |
| Ray Charles | Soul / R&B |
| Sam Cooke | Soul / R&B |
| Otis Redding | Soul / R&B |
| Marvin Gaye | Soul / R&B |
| Aretha Franklin | Soul / R&B |
| Al Green | Soul / R&B |
| Barry White | Soul / R&B |
| Amy Winehouse | Soul / R&B |
| Adele | Soul / R&B |
| Mariah Carey | Soul / R&B |
| Compay Segundo | Nueva trova / son cubano |
| Ibrahim Ferrer | Nueva trova / son cubano |
| Omara Portuondo | Nueva trova / son cubano |
| Buena Vista Social Club | Nueva trova / son cubano |
| Silvio Rodríguez | Nueva trova / son cubano |
| Pablo Milanés | Nueva trova / son cubano |
| Atahualpa Yupanqui | Nueva canción / música de protesta |
| Violeta Parra | Nueva canción / música de protesta |
| Víctor Jara | Nueva canción / música de protesta |
| Quilapayún | Nueva canción / música de protesta |
| Inti-Illimani | Nueva canción / música de protesta |
| Mercedes Sosa | Nueva canción / música de protesta |
| Daniel Viglietti | Nueva canción / música de protesta |
| Chico Buarque | Nueva canción / música de protesta |
| Bauhaus | Gothic / darkwave |
| The Sisters of Mercy | Gothic / darkwave |
| Fields of the Nephilim | Gothic / darkwave |
| Christian Death | Gothic / darkwave |
| Dead Can Dance | Gothic / darkwave |
| Tilo Wolff (Lacrimosa) | Gothic / darkwave |
| Scott Joplin | Ragtime |
| Eubie Blake | Ragtime |
| James P. Johnson | Ragtime |
| Jelly Roll Morton | Ragtime |
| Miriam Makeba | World / afrobeat / morna |
| Hugh Masekela | World / afrobeat / morna |
| Ladysmith Black Mambazo | World / afrobeat / morna |
| Salif Keita | World / afrobeat / morna |
| Ali Farka Touré | World / afrobeat / morna |
| Oumou Sangaré | World / afrobeat / morna |
| King Sunny Adé | World / afrobeat / morna |
| Fela Kuti | World / afrobeat / morna |
| Youssou N'Dour | World / afrobeat / morna |
| Baaba Maal | World / afrobeat / morna |
| Angelique Kidjo | World / afrobeat / morna |
| Franco Luambo | World / afrobeat / morna |
| Cesária Évora | World / afrobeat / morna |
| Ravi Shankar | Clásica de India |
| Ali Akbar Khan | Clásica de India |
| Zakir Hussain | Clásica de India |
| Lata Mangeshkar | Playback / Bollywood |
| Kishore Kumar | Playback / Bollywood |
| A.R. Rahman | Playback / Bollywood |
| Umm Kulthum | Música árabe clásica |
| Abdel Halim Hafez | Música árabe clásica |
| Fairuz | Música árabe clásica |
| Bijelo Dugme | Balcánica / eslava |
| Goran Bregović | Balcánica / eslava |
| Đorđe Balašević | Balcánica / eslava |
| Le Mystère des Voix Bulgares | Balcánica / eslava |
| Maria Tănase | Balcánica / eslava |
| Czesław Niemen | Balcánica / eslava |
| Viktor Tsoi (Kino) | Balcánica / eslava |
| Alla Pugacheva | Balcánica / eslava |
| Tarkan | Éxitos internacionales |
| Lou Bega | Éxitos internacionales |
| Falco | Éxitos internacionales |
| Nena | Éxitos internacionales |
| a-ha | Éxitos internacionales |
| Aqua | Éxitos internacionales |
| Los Del Río | Éxitos internacionales |
| Kaoma | Éxitos internacionales |
| Los Kjarkas | Éxitos internacionales |
| OMC | Éxitos internacionales |
| Ace of Base | Éxitos internacionales |
| Rednex | Éxitos internacionales |
| Vengaboys | Éxitos internacionales |
| 2 Unlimited | Éxitos internacionales |
| Haddaway | Éxitos internacionales |
| O-Zone | Éxitos internacionales |
| Las Ketchup | Éxitos internacionales |
| Eiffel 65 | Éxitos internacionales |
| Sandra | Éxitos internacionales |
| Amália Rodrigues | Fado |
| Carlos do Carmo | Fado |
| Dulce Pontes | Fado |
| Mariza | Fado |
