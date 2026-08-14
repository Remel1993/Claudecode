// @ts-nocheck
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Trophy, Settings, Calendar, History, Swords, ChevronLeft, Save, 
  Users, BarChart3, Play, RotateCcw, Check, Dice1, Dice2, Dice3, 
  Dice4, Dice5, Dice6, Globe, Shield as ShieldIcon, Info, ArrowRight, Dices,
  Wand2, Shuffle, ArrowUpCircle, ArrowDownCircle, AlertTriangle,
  Newspaper, TrendingUp, AlertCircle, Flame, Star, X, Megaphone, Eye, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { registerTitle, registerTitles } from '@/lib/palmares';
import { getCountryCode } from '@/lib/countries';
import TopWinnersTable from '@/components/TopWinnersTable';
import { CareerSelectView, CareerView, CareerMatchView, CareerSeasonReviewModal } from '@/components/CareerMode';
import { SimulationInjuryAlertModal } from '@/components/SimulationInjuryAlertModal';
import {
  CAREER_LEAGUE_ID, CAREER_DIV, DEFAULT_CAREER, worstTeams, tierOf, tierCaps, peCostFor,
  peForResult, repForMatch, clampRep, objectiveFor, expectedPosition, readPerformance, buildOffers,
  CONTRACT_SEASONS, CL_SPOTS, isSquadMaxed, clPhaseLabel, clProgressRep, fireChance, seasonObjectives,
  remainingUpgradeCost, capPE, signingRepBonus, evaluateApplication, getMarketVacancies,
  SPECIAL_OFFICE_WEEKS, calculateCurrentSeasonWeek
} from '@/lib/career';

// ==========================================
// 1. CONSTANTES DEL SISTEMA Y PRESETS
// ==========================================
const APP_ID = 'dice-football-hub-elite-v6'; // Actualizado v6

const PRESETS = {
  ES: [
    { name: 'Real Madrid', att: 5, opp: 5, def: 4, color1: '#ffffff', color2: '#1e3a8a', league: 'ES' },
    { name: 'FC Barcelona', att: 5, opp: 5, def: 4, color1: '#a71930', color2: '#004d98', league: 'ES' },
    { name: 'Atlético Madrid', att: 4, opp: 5, def: 4, color1: '#cb3524', color2: '#ffffff', league: 'ES' },
    { name: 'Villarreal CF', att: 4, opp: 5, def: 4, color1: '#facc15', color2: '#1e3a8a', league: 'ES' },
    { name: 'Real Sociedad', att: 4, opp: 4, def: 4, color1: '#004d98', color2: '#ffffff', league: 'ES' },
    { name: 'Athletic Club', att: 4, opp: 4, def: 4, color1: '#cb3524', color2: '#000000', league: 'ES' },
    { name: 'Girona FC', att: 3, opp: 4, def: 3, color1: '#cb3524', color2: '#ffffff', league: 'ES' },
    { name: 'Real Betis', att: 4, opp: 5, def: 3, color1: '#16a34a', color2: '#ffffff', league: 'ES' },
    { name: 'Valencia CF', att: 3, opp: 4, def: 3, color1: '#ffffff', color2: '#000000', league: 'ES' },
    { name: 'Sevilla FC', att: 3, opp: 4, def: 3, color1: '#ffffff', color2: '#cb3524', league: 'ES' },
    { name: 'Osasuna', att: 3, opp: 4, def: 4, color1: '#cb3524', color2: '#1e3a8a', league: 'ES' },
    { name: 'Getafe', att: 2, opp: 4, def: 4, color1: '#1e3a8a', color2: '#ffffff', league: 'ES' },
    { name: 'Celta Vigo', att: 4, opp: 4, def: 3, color1: '#87d3f8', color2: '#ffffff', league: 'ES' },
    { name: 'Mallorca', att: 3, opp: 3, def: 3, color1: '#cb3524', color2: '#000000', league: 'ES' },
    { name: 'Rayo Vallecano', att: 3, opp: 4, def: 4, color1: '#ffffff', color2: '#cb3524', league: 'ES' },
    { name: 'Elche CF', att: 3, opp: 3, def: 3, color1: '#ffffff', color2: '#006400', league: 'ES' },
    { name: 'Alavés', att: 2, opp: 3, def: 3, color1: '#1e3a8a', color2: '#ffffff', league: 'ES' },
    { name: 'Levante UD', att: 2, opp: 3, def: 2, color1: '#a71930', color2: '#004d98', league: 'ES' },
    { name: 'Real Oviedo', att: 2, opp: 3, def: 3, color1: '#00529f', color2: '#ffffff', league: 'ES' },
    { name: 'Espanyol', att: 3, opp: 4, def: 3, color1: '#004d98', color2: '#ffffff', league: 'ES' }
  ],
  IT: [
    { name: 'Inter Milan', att: 4, opp: 5, def: 4, color1: '#003399', color2: '#000000', league: 'IT' },
    { name: 'Juventus', att: 3, opp: 4, def: 4, color1: '#ffffff', color2: '#000000', league: 'IT' },
    { name: 'AC Milan', att: 4, opp: 4, def: 3, color1: '#fb090b', color2: '#000000', league: 'IT' },
    { name: 'Napoli', att: 4, opp: 4, def: 4, color1: '#00bfff', color2: '#ffffff', league: 'IT' },
    { name: 'AS Roma', att: 3, opp: 4, def: 4, color1: '#8e1f2f', color2: '#f0bc42', league: 'IT' },
    { name: 'Atalanta', att: 4, opp: 5, def: 3, color1: '#1e71b8', color2: '#000000', league: 'IT' },
    { name: 'Lazio', att: 3, opp: 4, def: 3, color1: '#87d3f8', color2: '#ffffff', league: 'IT' },
    { name: 'Fiorentina', att: 3, opp: 4, def: 3, color1: '#4b2e83', color2: '#ffffff', league: 'IT' },
    { name: 'Bologna', att: 3, opp: 4, def: 4, color1: '#a71930', color2: '#1e3a8a', league: 'IT' },
    { name: 'Torino', att: 2, opp: 3, def: 3, color1: '#8b0000', color2: '#ffffff', league: 'IT' },
    { name: 'Sassuolo', att: 3, opp: 4, def: 3, color1: '#000000', color2: '#00a650', league: 'IT' },
    { name: 'Genoa', att: 2, opp: 3, def: 3, color1: '#a71930', color2: '#1e3a8a', league: 'IT' },
    { name: 'Lecce', att: 1, opp: 2, def: 3, color1: '#facc15', color2: '#cb3524', league: 'IT' },
    { name: 'Udinese', att: 2, opp: 3, def: 3, color1: '#ffffff', color2: '#000000', league: 'IT' },
    { name: 'Cagliari', att: 2, opp: 2, def: 3, color1: '#a71930', color2: '#1e3a8a', league: 'IT' },
    { name: 'Pisa', att: 2, opp: 3, def: 3, color1: '#000000', color2: '#0033a0', league: 'IT' },
    { name: 'Verona', att: 2, opp: 2, def: 2, color1: '#facc15', color2: '#1e3a8a', league: 'IT' },
    { name: 'Parma', att: 2, opp: 3, def: 3, color1: '#ffffff', color2: '#000000', league: 'IT' },
    { name: 'Como', att: 3, opp: 4, def: 3, color1: '#1e3a8a', color2: '#ffffff', league: 'IT' },
    { name: 'Cremonese', att: 2, opp: 3, def: 3, color1: '#8b0000', color2: '#a9a9a9', league: 'IT' }
  ],
  EN: [
    { name: 'Manchester City', att: 5, opp: 5, def: 4, color1: '#6caee0', color2: '#ffffff', league: 'EN' },
    { name: 'Liverpool FC', att: 5, opp: 5, def: 3, color1: '#c8102e', color2: '#f6eb61', league: 'EN' },
    { name: 'Arsenal FC', att: 4, opp: 5, def: 4, color1: '#ef0107', color2: '#ffffff', league: 'EN' },
    { name: 'Aston Villa', att: 3, opp: 4, def: 4, color1: '#95bfe5', color2: '#670e36', league: 'EN' },
    { name: 'Tottenham', att: 4, opp: 4, def: 2, color1: '#ffffff', color2: '#132257', league: 'EN' },
    { name: 'Chelsea FC', att: 4, opp: 5, def: 3, color1: '#034694', color2: '#ffffff', league: 'EN' },
    { name: 'Man United', att: 3, opp: 4, def: 3, color1: '#da291c', color2: '#fbe122', league: 'EN' },
    { name: 'Newcastle', att: 4, opp: 4, def: 4, color1: '#ffffff', color2: '#000000', league: 'EN' },
    { name: 'West Ham', att: 2, opp: 3, def: 2, color1: '#7a263a', color2: '#1bb1e7', league: 'EN' },
    { name: 'Brighton', att: 3, opp: 4, def: 3, color1: '#0057b8', color2: '#ffffff', league: 'EN' },
    { name: 'Wolves', att: 2, opp: 3, def: 2, color1: '#facc15', color2: '#000000', league: 'EN' },
    { name: 'Bournemouth', att: 4, opp: 4, def: 3, color1: '#cb3524', color2: '#000000', league: 'EN' },
    { name: 'Fulham', att: 3, opp: 3, def: 3, color1: '#ffffff', color2: '#000000', league: 'EN' },
    { name: 'Crystal Palace', att: 3, opp: 4, def: 4, color1: '#1e3a8a', color2: '#cb3524', league: 'EN' },
    { name: 'Brentford', att: 3, opp: 4, def: 3, color1: '#cb3524', color2: '#ffffff', league: 'EN' },
    { name: 'Everton', att: 2, opp: 3, def: 4, color1: '#003399', color2: '#ffffff', league: 'EN' },
    { name: 'Nottingham Forest', att: 3, opp: 4, def: 4, color1: '#cb3524', color2: '#ffffff', league: 'EN' },
    { name: 'Leeds United', att: 3, opp: 4, def: 3, color1: '#ffffff', color2: '#1d428a', league: 'EN' },
    { name: 'Burnley', att: 2, opp: 3, def: 4, color1: '#6c1d45', color2: '#87ceeb', league: 'EN' },
    { name: 'Sunderland', att: 3, opp: 4, def: 4, color1: '#ff0000', color2: '#ffffff', league: 'EN' }
  ],
  NL: [ 
    { name: 'PSV Eindhoven', att: 4, opp: 5, def: 3, color1: '#ff0000', color2: '#ffffff', league: 'NL' },
    { name: 'Feyenoord', att: 4, opp: 4, def: 3, color1: '#ff0000', color2: '#ffffff', league: 'NL' },
    { name: 'Ajax', att: 3, opp: 4, def: 3, color1: '#ffffff', color2: '#ff0000', league: 'NL' },
    { name: 'AZ Alkmaar', att: 3, opp: 4, def: 3, color1: '#ff0000', color2: '#ffffff', league: 'NL' },
    { name: 'FC Twente', att: 3, opp: 3, def: 3, color1: '#ff0000', color2: '#ffffff', league: 'NL' },
    { name: 'Utrecht', att: 3, opp: 3, def: 3, color1: '#ff0000', color2: '#ffffff', league: 'NL' },
    { name: 'Sparta Rotterdam', att: 2, opp: 2, def: 2, color1: '#ff0000', color2: '#ffffff', league: 'NL' },
    { name: 'Go Ahead Eagles', att: 2, opp: 3, def: 3, color1: '#ff0000', color2: '#ffff00', league: 'NL' },
    { name: 'NEC Nijmegen', att: 2, opp: 3, def: 3, color1: '#ff0000', color2: '#000000', league: 'NL' },
    { name: 'Heerenveen', att: 2, opp: 2, def: 2, color1: '#0000ff', color2: '#ffffff', league: 'NL' },
    { name: 'Fortuna Sittard', att: 2, opp: 2, def: 2, color1: '#ffff00', color2: '#16a34a', league: 'NL' },
    { name: 'Heracles Almelo', att: 1, opp: 2, def: 2, color1: '#000000', color2: '#ffffff', league: 'NL' },
    { name: 'PEC Zwolle', att: 2, opp: 2, def: 2, color1: '#00bfff', color2: '#ffffff', league: 'NL' },
    { name: 'FC Volendam', att: 2, opp: 3, def: 2, color1: '#f5a12d', color2: '#000000', league: 'NL' },
    { name: 'Excelsior', att: 2, opp: 2, def: 2, color1: '#000000', color2: '#e30613', league: 'NL' },
    { name: 'SC Telstar', att: 1, opp: 2, def: 2, color1: '#ffffff', color2: '#0033a0', league: 'NL' },
    { name: 'Groningen', att: 2, opp: 3, def: 3, color1: '#16a34a', color2: '#ffffff', league: 'NL' },
    { name: 'NAC Breda', att: 2, opp: 2, def: 2, color1: '#ffff00', color2: '#000000', league: 'NL' }
  ],
  DE: [ 
    { name: 'Bayern Munich', att: 5, opp: 5, def: 4, color1: '#dc052d', color2: '#ffffff', league: 'DE' },
    { name: 'B. Dortmund', att: 4, opp: 4, def: 3, color1: '#fde100', color2: '#000000', league: 'DE' },
    { name: 'B. Leverkusen', att: 4, opp: 4, def: 3, color1: '#e32221', color2: '#000000', league: 'DE' },
    { name: 'RB Leipzig', att: 3, opp: 4, def: 3, color1: '#ffffff', color2: '#dd013f', league: 'DE' },
    { name: 'VfB Stuttgart', att: 3, opp: 4, def: 3, color1: '#ffffff', color2: '#e32221', league: 'DE' },
    { name: 'E. Frankfurt', att: 4, opp: 4, def: 2, color1: '#000000', color2: '#e32221', league: 'DE' },
    { name: 'SC Freiburg', att: 3, opp: 3, def: 4, color1: '#000000', color2: '#ffffff', league: 'DE' },
    { name: 'M\'gladbach', att: 2, opp: 3, def: 3, color1: '#000000', color2: '#ffffff', league: 'DE' },
    { name: 'Wolfsburg', att: 2, opp: 3, def: 3, color1: '#009d00', color2: '#ffffff', league: 'DE' },
    { name: 'Werder Bremen', att: 3, opp: 3, def: 2, color1: '#1d9053', color2: '#ffffff', league: 'DE' },
    { name: 'Union Berlin', att: 2, opp: 2, def: 4, color1: '#d71920', color2: '#f6d800', league: 'DE' },
    { name: 'Hoffenheim', att: 2, opp: 3, def: 2, color1: '#004f9f', color2: '#ffffff', league: 'DE' },
    { name: 'Augsburg', att: 2, opp: 3, def: 3, color1: '#ba3733', color2: '#ffffff', league: 'DE' },
    { name: 'Mainz 05', att: 3, opp: 3, def: 4, color1: '#ed1c24', color2: '#ffffff', league: 'DE' },
    { name: 'FC Köln', att: 3, opp: 4, def: 3, color1: '#e30613', color2: '#ffffff', league: 'DE' },
    { name: 'Heidenheim', att: 2, opp: 2, def: 2, color1: '#e2001a', color2: '#ffffff', league: 'DE' },
    { name: 'St. Pauli', att: 1, opp: 2, def: 4, color1: '#754b29', color2: '#ffffff', league: 'DE' },
    { name: 'Hamburger SV', att: 3, opp: 3, def: 3, color1: '#ffffff', color2: '#0033a0', league: 'DE' }
  ],
  FR: [ 
    { name: 'PSG', att: 5, opp: 5, def: 4, color1: '#004170', color2: '#da291c', league: 'FR' },
    { name: 'AS Monaco', att: 4, opp: 4, def: 3, color1: '#e30613', color2: '#ffffff', league: 'FR' },
    { name: 'Marseille', att: 4, opp: 4, def: 3, color1: '#ffffff', color2: '#009dff', league: 'FR' },
    { name: 'Lille OSC', att: 3, opp: 4, def: 4, color1: '#e2001a', color2: '#002654', league: 'FR' },
    { name: 'Olympique Lyon', att: 3, opp: 4, def: 3, color1: '#ffffff', color2: '#da291c', league: 'FR' },
    { name: 'RC Lens', att: 3, opp: 3, def: 4, color1: '#ed1c24', color2: '#ffcc00', league: 'FR' },
    { name: 'OGC Nice', att: 3, opp: 3, def: 3, color1: '#000000', color2: '#e30613', league: 'FR' },
    { name: 'Stade Rennais', att: 3, opp: 3, def: 2, color1: '#e2001a', color2: '#000000', league: 'FR' },
    { name: 'Paris FC', att: 2, opp: 3, def: 3, color1: '#0033a0', color2: '#ffffff', league: 'FR' },
    { name: 'Strasbourg', att: 3, opp: 4, def: 3, color1: '#00529f', color2: '#ffffff', league: 'FR' },
    { name: 'Toulouse', att: 2, opp: 3, def: 3, color1: '#542f88', color2: '#ffffff', league: 'FR' },
    { name: 'FC Lorient', att: 2, opp: 3, def: 2, color1: '#f68712', color2: '#000000', league: 'FR' },
    { name: 'FC Nantes', att: 2, opp: 2, def: 3, color1: '#fdf200', color2: '#006532', league: 'FR' },
    { name: 'Brest', att: 2, opp: 3, def: 3, color1: '#e2001a', color2: '#ffffff', league: 'FR' },
    { name: 'Le Havre', att: 1, opp: 2, def: 3, color1: '#00529f', color2: '#87ceeb', league: 'FR' },
    { name: 'AJ Auxerre', att: 2, opp: 3, def: 3, color1: '#ffffff', color2: '#00529f', league: 'FR' },
    { name: 'Angers SCO', att: 1, opp: 2, def: 3, color1: '#000000', color2: '#ffffff', league: 'FR' },
    { name: 'FC Metz', att: 2, opp: 3, def: 2, color1: '#6c1d45', color2: '#ffffff', league: 'FR' },
    ],
  MI: [ 
    { name: 'FC Porto', att: 3, opp: 4, def: 4, color1: '#003399', color2: '#ffffff', league: 'MI' },
    { name: 'Benfica', att: 4, opp: 4, def: 3, color1: '#e30613', color2: '#ffffff', league: 'MI' },
    { name: 'Sporting CP', att: 4, opp: 4, def: 3, color1: '#006532', color2: '#ffffff', league: 'MI' },
    { name: 'Celtic FC', att: 3, opp: 4, def: 3, color1: '#006532', color2: '#ffffff', league: 'MI' },
    { name: 'Rangers FC', att: 2, opp: 3, def: 3, color1: '#0033a0', color2: '#ffffff', league: 'MI' },
    { name: 'Galatasaray', att: 4, opp: 4, def: 3, color1: '#a32638', color2: '#fdb913', league: 'MI' },
    { name: 'Fenerbahçe', att: 3, opp: 4, def: 3, color1: '#0033a0', color2: '#fdb913', league: 'MI' },
    { name: 'Olympiacos', att: 3, opp: 4, def: 3, color1: '#e30613', color2: '#ffffff', league: 'MI' },
    { name: 'Panathinaikos', att: 3, opp: 3, def: 3, color1: '#006532', color2: '#ffffff', league: 'MI' },
    { name: 'Club Brugge', att: 3, opp: 4, def: 3, color1: '#0033a0', color2: '#000000', league: 'MI' },
    { name: 'Anderlecht', att: 3, opp: 3, def: 3, color1: '#542f88', color2: '#ffffff', league: 'MI' },
    { name: 'RB Salzburg', att: 3, opp: 3, def: 2, color1: '#ffffff', color2: '#e30613', league: 'MI' },
    { name: 'Slavia Praga', att: 3, opp: 3, def: 4, color1: '#e30613', color2: '#ffffff', league: 'MI' },
    { name: 'Sparta Praga', att: 2, opp: 3, def: 3, color1: '#a32638', color2: '#0033a0', league: 'MI' },
    { name: 'Dinamo Zagreb', att: 2, opp: 3, def: 3, color1: '#0033a0', color2: '#ffffff', league: 'MI' },
    { name: 'Estrella Roja', att: 3, opp: 3, def: 2, color1: '#e30613', color2: '#ffffff', league: 'MI' },
    { name: 'FC Copenhague', att: 2, opp: 3, def: 3, color1: '#ffffff', color2: '#0033a0', league: 'MI' },
    { name: 'Malmö FF', att: 2, opp: 2, def: 3, color1: '#87ceeb', color2: '#ffffff', league: 'MI' },
    { name: 'Shakhtar D.', att: 3, opp: 3, def: 3, color1: '#f68712', color2: '#000000', league: 'MI' },
    { name: 'Dynamo Kyiv', att: 2, opp: 2, def: 3, color1: '#ffffff', color2: '#0033a0', league: 'MI' }
  ],
  WC: [
    { name: 'Argentina', att: 4, opp: 5, def: 4, color1: '#75aadb', color2: '#ffffff', isFlag: true, region: 'SA' },
    { name: 'France', att: 5, opp: 5, def: 3, color1: '#002395', color2: '#ffffff', isFlag: true, region: 'EU' },
    { name: 'Brazil', att: 4, opp: 5, def: 3, color1: '#fedf00', color2: '#009b3a', isFlag: true, region: 'SA' },
    { name: 'England', att: 4, opp: 5, def: 4, color1: '#ffffff', color2: '#ce1124', isFlag: true, region: 'EU' },
    { name: 'Spain', att: 5, opp: 5, def: 4, color1: '#aa151b', color2: '#f1bf00', isFlag: true, region: 'EU' },
    { name: 'Germany', att: 4, opp: 4, def: 3, color1: '#000000', color2: '#ffce00', isFlag: true, region: 'EU' },
    { name: 'Portugal', att: 4, opp: 5, def: 3, color1: '#046a38', color2: '#da291c', isFlag: true, region: 'EU' },
    { name: 'Netherlands', att: 4, opp: 4, def: 3, color1: '#f36c21', color2: '#ffffff', isFlag: true, region: 'EU' },
    { name: 'Italy', att: 3, opp: 4, def: 4, color1: '#008c45', color2: '#ffffff', isFlag: true, region: 'EU' },
    { name: 'Uruguay', att: 3, opp: 4, def: 4, color1: '#0081c8', color2: '#ffffff', isFlag: true, region: 'SA' },
    { name: 'Croatia', att: 3, opp: 4, def: 3, color1: '#ff0000', color2: '#ffffff', isFlag: true, region: 'EU' },
    { name: 'Morocco', att: 3, opp: 3, def: 4, color1: '#c1272d', color2: '#006233', isFlag: true, region: 'AF' },
    { name: 'Japan', att: 3, opp: 4, def: 3, color1: '#ffffff', color2: '#bc002d', isFlag: true, region: 'AS' },
    { name: 'USA', att: 3, opp: 3, def: 3, color1: '#b22234', color2: '#3c3b6e', isFlag: true, region: 'NA' },
    { name: 'Mexico', att: 2, opp: 3, def: 3, color1: '#006847', color2: '#ce1126', isFlag: true, region: 'NA' },
    { name: 'Colombia', att: 3, opp: 4, def: 3, color1: '#fcd116', color2: '#003893', isFlag: true, region: 'SA' },
    { name: 'Belgium', att: 3, opp: 4, def: 3, color1: '#e30613', color2: '#000000', isFlag: true, region: 'EU' },
    { name: 'Senegal', att: 3, opp: 3, def: 4, color1: '#00853f', color2: '#fdef42', isFlag: true, region: 'AF' },
    { name: 'Switzerland', att: 2, opp: 3, def: 4, color1: '#d52b1e', color2: '#ffffff', isFlag: true, region: 'EU' },
    { name: 'Denmark', att: 3, opp: 3, def: 3, color1: '#c60c30', color2: '#ffffff', isFlag: true, region: 'EU' },
    { name: 'South Korea', att: 3, opp: 3, def: 3, color1: '#ffffff', color2: '#cd2e3a', isFlag: true, region: 'AS' },
    { name: 'Chile', att: 2, opp: 2, def: 2, color1: '#0039a6', color2: '#d52b1e', isFlag: true, region: 'SA' },
    { name: 'Ecuador', att: 2, opp: 3, def: 4, color1: '#ffdd00', color2: '#0033a0', isFlag: true, region: 'SA' },
    { name: 'Nigeria', att: 3, opp: 3, def: 3, color1: '#008751', color2: '#ffffff', isFlag: true, region: 'AF' },
    { name: 'Cameroon', att: 2, opp: 3, def: 3, color1: '#007a5e', color2: '#ce1126', isFlag: true, region: 'AF' },
    { name: 'Ghana', att: 2, opp: 3, def: 2, color1: '#ffffff', color2: '#000000', isFlag: true, region: 'AF' },
    { name: 'Canada', att: 2, opp: 3, def: 3, color1: '#ff0000', color2: '#ffffff', isFlag: true, region: 'NA' },
    { name: 'Australia', att: 2, opp: 2, def: 3, color1: '#00008b', color2: '#ffcd00', isFlag: true, region: 'AS' },
    { name: 'Serbia', att: 3, opp: 3, def: 2, color1: '#c6363c', color2: '#0c4076', isFlag: true, region: 'EU' },
    { name: 'Poland', att: 2, opp: 3, def: 3, color1: '#ffffff', color2: '#dc143c', isFlag: true, region: 'EU' },
    { name: 'Peru', att: 1, opp: 2, def: 3, color1: '#ffffff', color2: '#d91023', isFlag: true, region: 'SA' },
    { name: 'Egypt', att: 2, opp: 3, def: 3, color1: '#ce1126', color2: '#000000', isFlag: true, region: 'AF' }
  ]
};

// ==========================================
// DERBYS Y CLÁSICOS
// ==========================================
const DERBY_PAIRS: { teams: [string, string]; name: string; emoji: string; intensity: number }[] = [
  // España
  { teams: ['Real Madrid', 'FC Barcelona'], name: 'El Clásico', emoji: '🔥', intensity: 5 },
  { teams: ['Real Madrid', 'Atlético Madrid'], name: 'Derby de Madrid', emoji: '⚔️', intensity: 5 },
  { teams: ['FC Barcelona', 'Espanyol'], name: 'Derby Catalán', emoji: '🏟️', intensity: 4 },
  { teams: ['Sevilla FC', 'Real Betis'], name: 'Gran Derbi de Sevilla', emoji: '💚❤️', intensity: 5 },
  { teams: ['Real Sociedad', 'Athletic Club'], name: 'Derby Vasco', emoji: '🔴🔵', intensity: 5 },
  { teams: ['Valencia CF', 'Villarreal CF'], name: 'Derby de la Comunitat', emoji: '🍊', intensity: 3 },
  { teams: ['Celta Vigo', 'Dep. La Coruña'], name: 'Derby Gallego', emoji: '🌊', intensity: 4 },
  { teams: ['Real Oviedo', 'Sporting Gijón'], name: 'Derby Asturiano', emoji: '⛰️', intensity: 5 },
  // Italia
  { teams: ['Inter Milan', 'AC Milan'], name: 'Derby della Madonnina', emoji: '🏛️', intensity: 5 },
  { teams: ['AS Roma', 'Lazio'], name: 'Derby della Capitale', emoji: '🐺🦅', intensity: 5 },
  { teams: ['Juventus', 'Inter Milan'], name: 'Derby d\'Italia', emoji: '🇮🇹', intensity: 5 },
  { teams: ['Juventus', 'Torino'], name: 'Derby della Mole', emoji: '🏔️', intensity: 5 },
  { teams: ['Genoa', 'Sampdoria'], name: 'Derby della Lanterna', emoji: '🏮', intensity: 4 },
  { teams: ['Napoli', 'Juventus'], name: 'Il Grande Classico', emoji: '⚡', intensity: 4 },
  // Inglaterra
  { teams: ['Liverpool FC', 'Man United'], name: 'Northwest Derby', emoji: '🔴', intensity: 5 },
  { teams: ['Manchester City', 'Man United'], name: 'Manchester Derby', emoji: '🏙️', intensity: 5 },
  { teams: ['Arsenal FC', 'Tottenham'], name: 'North London Derby', emoji: '🏟️', intensity: 5 },
  { teams: ['Liverpool FC', 'Everton'], name: 'Merseyside Derby', emoji: '🔵🔴', intensity: 5 },
  { teams: ['Chelsea FC', 'Arsenal FC'], name: 'London Rivalry', emoji: '🇬🇧', intensity: 4 },
  { teams: ['Chelsea FC', 'Tottenham'], name: 'London Derby', emoji: '💙🤍', intensity: 4 },
  { teams: ['Newcastle', 'Sunderland'], name: 'Tyne-Wear Derby', emoji: '⚫⬜', intensity: 5 },
  { teams: ['Leeds United', 'Man United'], name: 'Roses Rivalry', emoji: '🌹', intensity: 5 },
  // Alemania
  { teams: ['Bayern Munich', 'B. Dortmund'], name: 'Der Klassiker', emoji: '🇩🇪', intensity: 5 },
  { teams: ['B. Dortmund', 'Schalke 04'], name: 'Revierderby', emoji: '⛏️', intensity: 5 },
  { teams: ['Bayern Munich', 'B. Leverkusen'], name: 'TopSpiel', emoji: '🔝', intensity: 4 },
  { teams: ['Werder Bremen', 'Hamburger SV'], name: 'Nordderby', emoji: '🌊', intensity: 4 },
  // Francia
  { teams: ['PSG', 'Marseille'], name: 'Le Classique', emoji: '🇫🇷', intensity: 5 },
  { teams: ['Olympique Lyon', 'Saint-Étienne'], name: 'Derby Rhône-Alpes', emoji: '🦁', intensity: 5 },
  { teams: ['Olympique Lyon', 'Marseille'], name: 'Olympique Clásico', emoji: '🏛️', intensity: 4 },
  { teams: ['RC Lens', 'Lille OSC'], name: 'Derby du Nord', emoji: '🏗️', intensity: 4 },
  // Holanda
  { teams: ['Ajax', 'Feyenoord'], name: 'De Klassieker', emoji: '🇳🇱', intensity: 5 },
  { teams: ['Ajax', 'PSV Eindhoven'], name: 'De Topper', emoji: '🏆', intensity: 5 },
  { teams: ['Feyenoord', 'Sparta Rotterdam'], name: 'Stadsderby Rotterdam', emoji: '🏙️', intensity: 4 },
  // Portugal / Miscelánea
  { teams: ['Benfica', 'Sporting CP'], name: 'Derby de Lisboa', emoji: '🏟️', intensity: 5 },
  { teams: ['FC Porto', 'Benfica'], name: 'O Clássico', emoji: '🇵🇹', intensity: 5 },
  { teams: ['FC Porto', 'Sporting CP'], name: 'Clássico Lusitano', emoji: '🏛️', intensity: 4 },
  { teams: ['Celtic FC', 'Rangers FC'], name: 'Old Firm', emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', intensity: 5 },
  { teams: ['Galatasaray', 'Fenerbahçe'], name: 'Kıtalar Arası Derbi', emoji: '🇹🇷', intensity: 5 },
  { teams: ['Olympiacos', 'Panathinaikos'], name: 'Derby de los Eternos', emoji: '🇬🇷', intensity: 5 },
  // Mundiales
  { teams: ['Argentina', 'Brazil'], name: 'Superclásico Sudamericano', emoji: '🌎', intensity: 5 },
  { teams: ['Argentina', 'England'], name: 'La Mano de Dios', emoji: '✋', intensity: 5 },
  { teams: ['Argentina', 'Germany'], name: 'Clásico Mundial', emoji: '🏆', intensity: 5 },
  { teams: ['Brazil', 'Germany'], name: 'Rivalidad Histórica', emoji: '⚽', intensity: 4 },
  { teams: ['France', 'Germany'], name: 'Le Classique Internacional', emoji: '🇪🇺', intensity: 4 },
  { teams: ['Spain', 'Italy'], name: 'Mediterráneo', emoji: '🌊', intensity: 4 },
  { teams: ['England', 'Germany'], name: 'Rivalidad Eterna', emoji: '🦁🦅', intensity: 5 },
  { teams: ['France', 'Argentina'], name: 'Final del Mundo', emoji: '🏆', intensity: 5 },
  { teams: ['Mexico', 'USA'], name: 'Clásico de CONCACAF', emoji: '🌮🗽', intensity: 5 },
  { teams: ['Brazil', 'Argentina'], name: 'Superclásico de las Américas', emoji: '🔥', intensity: 5 },
  { teams: ['Uruguay', 'Argentina'], name: 'Clásico del Río de la Plata', emoji: '🌊', intensity: 5 },
  { teams: ['Chile', 'Argentina'], name: 'Clásico Trasandino', emoji: '🏔️', intensity: 4 },
  { teams: ['Colombia', 'Argentina'], name: 'Clásico Suramericano', emoji: '☕', intensity: 3 },
];

// Helper para detectar derbys
const findDerby = (teamName1: string, teamName2: string) => {
  return DERBY_PAIRS.find(d =>
    (d.teams[0] === teamName1 && d.teams[1] === teamName2) ||
    (d.teams[0] === teamName2 && d.teams[1] === teamName1)
  );
};

// ==========================================
// NUEVO: PRESETS SEGUNDA DIVISIÓN
// ==========================================
const PRESETS_2 = {
  ES: [
    { name: 'Almería', att: 3, opp: 4, def: 3, color1: '#e30613', color2: '#ffffff', league: 'ES' },
    { name: 'Cádiz CF', att: 3, opp: 3, def: 3, color1: '#fde100', color2: '#0000ff', league: 'ES' },
    { name: 'Granada CF', att: 3, opp: 3, def: 3, color1: '#c8102e', color2: '#ffffff', league: 'ES' },
    { name: 'SD Eibar', att: 3, opp: 3, def: 3, color1: '#a71930', color2: '#004d98', league: 'ES' },
    { name: 'Sporting Gijón', att: 4, opp: 4, def: 3, color1: '#e30613', color2: '#ffffff', league: 'ES' },
    { name: 'Valladolid', att: 3, opp: 3, def: 3, color1: '#ffffff', color2: '#951b81', league: 'ES' },
    { name: 'Las Palmas', att: 4, opp: 4, def: 3, color1: '#facc15', color2: '#1e3a8a', league: 'ES' },
    { name: 'Real Zaragoza', att: 2, opp: 3, def: 3, color1: '#ffffff', color2: '#00529f', league: 'ES' },
    { name: 'Racing Santander', att: 4, opp: 4, def: 3, color1: '#ffffff', color2: '#006400', league: 'ES' },
    { name: 'Leganés', att: 3, opp: 3, def: 4, color1: '#ffffff', color2: '#1e3a8a', league: 'ES' },
    { name: 'CD Tenerife', att: 2, opp: 2, def: 2, color1: '#ffffff', color2: '#00529f', league: 'ES' },
    { name: 'Burgos CF', att: 2, opp: 3, def: 3, color1: '#ffffff', color2: '#000000', league: 'ES' },
    { name: 'SD Huesca', att: 2, opp: 3, def: 3, color1: '#a71930', color2: '#004d98', league: 'ES' },
    { name: 'Málaga CF', att: 3, opp: 3, def: 3, color1: '#ffffff', color2: '#87ceeb', league: 'ES' },
    { name: 'Dep. La Coruña', att: 3, opp: 4, def: 3, color1: '#ffffff', color2: '#00529f', league: 'ES' },
    { name: 'Castellón', att: 3, opp: 3, def: 2, color1: '#000000', color2: '#ffffff', league: 'ES' },
    { name: 'Córdoba CF', att: 2, opp: 3, def: 3, color1: '#ffffff', color2: '#006400', league: 'ES' },
    { name: 'Albacete', att: 2, opp: 2, def: 3, color1: '#ffffff', color2: '#8b0000', league: 'ES' },
    { name: 'Mirandés', att: 2, opp: 3, def: 3, color1: '#e30613', color2: '#000000', league: 'ES' },
    { name: 'Eldense', att: 1, opp: 2, def: 2, color1: '#e30613', color2: '#0000ff', league: 'ES' }
  ],
  EN: [
    { name: 'Leicester City', att: 4, opp: 4, def: 3, color1: '#1e3a8a', color2: '#ffffff', league: 'EN' },
    { name: 'Ipswich Town', att: 3, opp: 4, def: 3, color1: '#1e3a8a', color2: '#ffffff', league: 'EN' },
    { name: 'Sheffield United', att: 4, opp: 4, def: 3, color1: '#ee2737', color2: '#ffffff', league: 'EN' },
    { name: 'Luton Town', att: 2, opp: 3, def: 3, color1: '#f78f1e', color2: '#000000', league: 'EN' },
    { name: 'West Bromwich', att: 3, opp: 3, def: 3, color1: '#002f68', color2: '#ffffff', league: 'EN' },
    { name: 'Norwich City', att: 3, opp: 3, def: 2, color1: '#fff200', color2: '#00a650', league: 'EN' },
    { name: 'Southampton', att: 3, opp: 4, def: 3, color1: '#cb3524', color2: '#ffffff', league: 'EN' },
    { name: 'Middlesbrough', att: 3, opp: 4, def: 3, color1: '#e30613', color2: '#ffffff', league: 'EN' },
    { name: 'Coventry City', att: 4, opp: 4, def: 3, color1: '#87ceeb', color2: '#ffffff', league: 'EN' },
    { name: 'Hull City', att: 2, opp: 3, def: 2, color1: '#f5a12d', color2: '#000000', league: 'EN' },
    { name: 'Watford', att: 3, opp: 3, def: 3, color1: '#fbee21', color2: '#ed2127', league: 'EN' },
    { name: 'Bristol City', att: 3, opp: 3, def: 3, color1: '#e30613', color2: '#ffffff', league: 'EN' },
    { name: 'Swansea City', att: 2, opp: 3, def: 2, color1: '#ffffff', color2: '#000000', league: 'EN' },
    { name: 'Preston N.E.', att: 2, opp: 2, def: 3, color1: '#ffffff', color2: '#000040', league: 'EN' },
    { name: 'QPR', att: 2, opp: 2, def: 3, color1: '#ffffff', color2: '#0033a0', league: 'EN' },
    { name: 'Stoke City', att: 2, opp: 3, def: 3, color1: '#e30613', color2: '#ffffff', league: 'EN' },
    { name: 'Sheffield Wed', att: 2, opp: 3, def: 3, color1: '#0033a0', color2: '#ffffff', league: 'EN' },
    { name: 'Blackburn', att: 3, opp: 3, def: 3, color1: '#0033a0', color2: '#ffffff', league: 'EN' },
    { name: 'Millwall', att: 2, opp: 2, def: 3, color1: '#000040', color2: '#ffffff', league: 'EN' },
    { name: 'Derby County', att: 2, opp: 2, def: 3, color1: '#ffffff', color2: '#000000', league: 'EN' }
  ],
  IT: [
    { name: 'Monza', att: 3, opp: 4, def: 3, color1: '#ffffff', color2: '#cb3524', league: 'IT' },
    { name: 'Frosinone', att: 2, opp: 3, def: 3, color1: '#ffcc00', color2: '#0033a0', league: 'IT' },
    { name: 'Salernitana', att: 2, opp: 3, def: 3, color1: '#8b0000', color2: '#ffffff', league: 'IT' },
    { name: 'Sampdoria', att: 2, opp: 3, def: 3, color1: '#0033a0', color2: '#ffffff', league: 'IT' },
    { name: 'Palermo', att: 4, opp: 4, def: 3, color1: '#ffc0cb', color2: '#000000', league: 'IT' },
    { name: 'Venezia', att: 3, opp: 3, def: 3, color1: '#fb923c', color2: '#16a34a', league: 'IT' },
    { name: 'Brescia', att: 2, opp: 3, def: 3, color1: '#0033a0', color2: '#ffffff', league: 'IT' },
    { name: 'Bari', att: 3, opp: 3, def: 3, color1: '#ffffff', color2: '#e30613', league: 'IT' },
    { name: 'Empoli', att: 3, opp: 3, def: 3, color1: '#1e3a8a', color2: '#ffffff', league: 'IT' },
    { name: 'Spezia', att: 3, opp: 3, def: 3, color1: '#ffffff', color2: '#000000', league: 'IT' },
    { name: 'Catanzaro', att: 3, opp: 3, def: 2, color1: '#ffcc00', color2: '#e30613', league: 'IT' },
    { name: 'Reggiana', att: 2, opp: 2, def: 3, color1: '#8b0000', color2: '#ffffff', league: 'IT' },
    { name: 'Südtirol', att: 2, opp: 2, def: 3, color1: '#ffffff', color2: '#e30613', league: 'IT' },
    { name: 'Modena', att: 3, opp: 3, def: 3, color1: '#ffcc00', color2: '#0033a0', league: 'IT' },
    { name: 'Cosenza', att: 1, opp: 2, def: 2, color1: '#0033a0', color2: '#e30613', league: 'IT' },
    { name: 'Cittadella', att: 2, opp: 2, def: 3, color1: '#8b0000', color2: '#ffffff', league: 'IT' },
    { name: 'Mantova', att: 2, opp: 2, def: 2, color1: '#ffffff', color2: '#e30613', league: 'IT' },
    { name: 'Cesena', att: 2, opp: 3, def: 3, color1: '#ffffff', color2: '#000000', league: 'IT' },
    { name: 'Juve Stabia', att: 2, opp: 3, def: 3, color1: '#ffcc00', color2: '#0033a0', league: 'IT' },
    { name: 'Carrarese', att: 2, opp: 2, def: 3, color1: '#ffcc00', color2: '#0033a0', league: 'IT' }
  ],
  DE: [
    { name: 'VfL Bochum', att: 3, opp: 3, def: 3, color1: '#005ca9', color2: '#ffffff', league: 'DE' },
    { name: 'Darmstadt 98', att: 2, opp: 3, def: 3, color1: '#0033a0', color2: '#ffffff', league: 'DE' },
    { name: 'Holstein Kiel', att: 3, opp: 3, def: 3, color1: '#0053a4', color2: '#ffffff', league: 'DE' },
    { name: 'Hertha BSC', att: 3, opp: 3, def: 2, color1: '#0033a0', color2: '#ffffff', league: 'DE' },
    { name: 'Schalke 04', att: 3, opp: 3, def: 3, color1: '#0033a0', color2: '#ffffff', league: 'DE' },
    { name: 'Hannover 96', att: 3, opp: 3, def: 3, color1: '#e30613', color2: '#000000', league: 'DE' },
    { name: 'F. Düsseldorf', att: 3, opp: 3, def: 3, color1: '#e30613', color2: '#ffffff', league: 'DE' },
    { name: 'Karlsruher SC', att: 3, opp: 4, def: 3, color1: '#0033a0', color2: '#ffffff', league: 'DE' },
    { name: 'FC Nürnberg', att: 2, opp: 3, def: 3, color1: '#8b0000', color2: '#ffffff', league: 'DE' },
    { name: 'SC Paderborn', att: 3, opp: 4, def: 2, color1: '#000000', color2: '#0033a0', league: 'DE' },
    { name: 'Greuther Fürth', att: 2, opp: 3, def: 2, color1: '#00a650', color2: '#ffffff', league: 'DE' },
    { name: 'SV Elversberg', att: 3, opp: 3, def: 3, color1: '#ffffff', color2: '#000000', league: 'DE' },
    { name: 'FC Magdeburg', att: 3, opp: 3, def: 3, color1: '#0033a0', color2: '#ffffff', league: 'DE' },
    { name: 'E. Braunschweig', att: 2, opp: 2, def: 3, color1: '#ffcc00', color2: '#0033a0', league: 'DE' },
    { name: 'Kaiserslautern', att: 3, opp: 3, def: 3, color1: '#e30613', color2: '#ffffff', league: 'DE' },
    { name: 'SSV Ulm', att: 1, opp: 2, def: 2, color1: '#000000', color2: '#ffffff', league: 'DE' },
    { name: 'Preußen Münster', att: 2, opp: 2, def: 3, color1: '#00a650', color2: '#000000', league: 'DE' },
    { name: 'Jahn Regensburg', att: 1, opp: 2, def: 2, color1: '#ffffff', color2: '#e30613', league: 'DE' }
  ],
  FR: [
    { name: 'Clermont Foot', att: 3, opp: 3, def: 3, color1: '#e30613', color2: '#0033a0', league: 'FR' },
    { name: 'Valenciennes FC', att: 2, opp: 2, def: 2, color1: '#e30613', color2: '#ffffff', league: 'FR' },
    { name: 'Chamois Niortais', att: 1, opp: 2, def: 2, color1: '#ffcc00', color2: '#006400', league: 'FR' },
    { name: 'Stade Reims', att: 3, opp: 4, def: 3, color1: '#e30613', color2: '#ffffff', league: 'FR' },
    { name: 'Rodez AF', att: 2, opp: 3, def: 3, color1: '#e30613', color2: '#ffcc00', league: 'FR' },
    { name: 'SM Caen', att: 2, opp: 2, def: 2, color1: '#0033a0', color2: '#e30613', league: 'FR' },
    { name: 'EA Guingamp', att: 3, opp: 3, def: 3, color1: '#e30613', color2: '#000000', league: 'FR' },
    { name: 'Amiens SC', att: 2, opp: 3, def: 3, color1: '#ffffff', color2: '#000000', league: 'FR' },
    { name: 'SC Bastia', att: 2, opp: 3, def: 3, color1: '#0033a0', color2: '#ffffff', league: 'FR' },
    { name: 'Pau FC', att: 2, opp: 2, def: 3, color1: '#ffcc00', color2: '#0033a0', league: 'FR' },
    { name: 'Grenoble Foot', att: 2, opp: 3, def: 3, color1: '#0033a0', color2: '#ffffff', league: 'FR' },
    { name: 'FC Annecy', att: 2, opp: 2, def: 2, color1: '#e30613', color2: '#ffffff', league: 'FR' },
    { name: 'ES Troyes AC', att: 2, opp: 3, def: 2, color1: '#0033a0', color2: '#ffffff', league: 'FR' },
    { name: 'AC Ajaccio', att: 2, opp: 2, def: 3, color1: '#ffffff', color2: '#e30613', league: 'FR' },
    { name: 'USL Dunkerque', att: 3, opp: 3, def: 3, color1: '#87ceeb', color2: '#ffffff', league: 'FR' },
    { name: 'Red Star FC', att: 2, opp: 2, def: 3, color1: '#00a650', color2: '#ffffff', league: 'FR' },
    { name: 'Saint-Étienne', att: 4, opp: 4, def: 3, color1: '#006532', color2: '#ffffff', league: 'FR' },
    { name: 'Montpellier', att: 3, opp: 3, def: 3, color1: '#0033a0', color2: '#f68712', league: 'FR' }
  ],
  NL: [
    { name: 'Willem II', att: 3, opp: 3, def: 3, color1: '#ff0000', color2: '#ffffff', league: 'NL' },
    { name: 'Vitesse', att: 2, opp: 2, def: 2, color1: '#ffcc00', color2: '#000000', league: 'NL' },
    { name: 'Almere City', att: 2, opp: 3, def: 2, color1: '#ff0000', color2: '#000000', league: 'NL' },
    { name: 'De Graafschap', att: 3, opp: 3, def: 3, color1: '#0033a0', color2: '#ffffff', league: 'NL' },
    { name: 'ADO Den Haag', att: 3, opp: 3, def: 3, color1: '#00a650', color2: '#ffcc00', league: 'NL' },
    { name: 'SC Cambuur', att: 3, opp: 3, def: 2, color1: '#ffcc00', color2: '#0033a0', league: 'NL' },
    { name: 'FC Emmen', att: 3, opp: 3, def: 3, color1: '#e30613', color2: '#ffffff', league: 'NL' },
    { name: 'Roda JC', att: 3, opp: 3, def: 3, color1: '#ffcc00', color2: '#000000', league: 'NL' },
    { name: 'MVV Maastricht', att: 2, opp: 2, def: 2, color1: '#e30613', color2: '#ffffff', league: 'NL' },
    { name: 'VVV-Venlo', att: 2, opp: 3, def: 2, color1: '#ffcc00', color2: '#000000', league: 'NL' },
    { name: 'FC Dordrecht', att: 2, opp: 3, def: 2, color1: '#00a650', color2: '#ffffff', league: 'NL' },
    { name: 'Helmond Sport', att: 2, opp: 2, def: 2, color1: '#e30613', color2: '#000000', league: 'NL' },
    { name: 'FC Eindhoven', att: 2, opp: 3, def: 2, color1: '#0033a0', color2: '#ffffff', league: 'NL' },
    { name: 'RKC Waalwijk', att: 2, opp: 3, def: 2, color1: '#ffff00', color2: '#1e3a8a', league: 'NL' },
    { name: 'TOP Oss', att: 1, opp: 2, def: 2, color1: '#e30613', color2: '#ffffff', league: 'NL' },
    { name: 'FC Den Bosch', att: 2, opp: 2, def: 2, color1: '#0033a0', color2: '#ffffff', league: 'NL' },
    { name: 'Jong Ajax', att: 3, opp: 4, def: 1, color1: '#ffffff', color2: '#e30613', league: 'NL' },
    { name: 'Jong PSV', att: 3, opp: 4, def: 1, color1: '#ff0000', color2: '#ffffff', league: 'NL' }
  ],
  MI: [
    { name: 'SC Braga', att: 4, opp: 4, def: 3, color1: '#e30613', color2: '#ffffff', league: 'MI' },
    { name: 'Besiktas', att: 3, opp: 3, def: 2, color1: '#000000', color2: '#ffffff', league: 'MI' },
    { name: 'AEK Athens', att: 3, opp: 3, def: 3, color1: '#fde100', color2: '#000000', league: 'MI' },
    { name: 'PAOK', att: 3, opp: 4, def: 3, color1: '#000000', color2: '#ffffff', league: 'MI' },
    { name: 'KRC Genk', att: 3, opp: 4, def: 3, color1: '#0033a0', color2: '#ffffff', league: 'MI' },
    { name: 'Royal Antwerp', att: 2, opp: 3, def: 3, color1: '#e30613', color2: '#ffffff', league: 'MI' },
    { name: 'Young Boys', att: 3, opp: 3, def: 2, color1: '#ffd700', color2: '#000000', league: 'MI' },
    { name: 'FC Basel', att: 4, opp: 4, def: 3, color1: '#e30613', color2: '#0033a0', league: 'MI' },
    { name: 'Trabzonspor', att: 3, opp: 3, def: 3, color1: '#8b0000', color2: '#87ceeb', league: 'MI' },
    { name: 'Hajduk Split', att: 2, opp: 3, def: 3, color1: '#ffffff', color2: '#0033a0', league: 'MI' },
    { name: 'FC Midtjylland', att: 4, opp: 4, def: 3, color1: '#000000', color2: '#e30613', league: 'MI' },
    { name: 'Brøndby IF', att: 2, opp: 3, def: 3, color1: '#ffd700', color2: '#0033a0', league: 'MI' },
    { name: 'Sturm Graz', att: 3, opp: 3, def: 3, color1: '#000000', color2: '#ffffff', league: 'MI' },
    { name: 'Viktoria Plzen', att: 3, opp: 3, def: 3, color1: '#e30613', color2: '#0033a0', league: 'MI' },
    { name: 'Ferencvaros', att: 3, opp: 3, def: 3, color1: '#00a650', color2: '#ffffff', league: 'MI' },
    { name: 'Ludogorets', att: 3, opp: 3, def: 3, color1: '#00a650', color2: '#ffffff', league: 'MI' },
    { name: 'Bodo/Glimt', att: 4, opp: 4, def: 3, color1: '#ffff00', color2: '#000000', league: 'MI' },
    { name: 'Qarabag FK', att: 3, opp: 3, def: 3, color1: '#000000', color2: '#ffffff', league: 'MI' },
    { name: 'Maccabi Tel Aviv', att: 3, opp: 3, def: 2, color1: '#ffd700', color2: '#0033a0', league: 'MI' },
    { name: 'Legia Warsaw', att: 2, opp: 3, def: 3, color1: '#ffffff', color2: '#000000', league: 'MI' }
  ]
};

// ==========================================
// 2. HELPERS Y GENERADORES
// ==========================================

let globalAudioCtx: any = null;
const playClick = () => {
  try {
    if (!globalAudioCtx) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) globalAudioCtx = new AudioContext();
    }
    if (!globalAudioCtx) return;
    if (globalAudioCtx.state === 'suspended') globalAudioCtx.resume();

    const osc = globalAudioCtx.createOscillator();
    const gain = globalAudioCtx.createGain();
    osc.connect(gain);
    gain.connect(globalAudioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, globalAudioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, globalAudioCtx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.1, globalAudioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, globalAudioCtx.currentTime + 0.05);
    osc.start();
    osc.stop(globalAudioCtx.currentTime + 0.05);
  } catch (e) {}
};

// MODIFICADO: Genera ambas divisiones para las ligas
const getDefaultComps = () => {
  const baseTeam = (preset, isDiv2 = false) => {
    const list = isDiv2 ? PRESETS_2[preset] : PRESETS[preset];
    if (!list) return [];
    const offset = isDiv2 ? 100 : 0; // Previene colisiones de ID
    return list.map((t, i) => ({ ...t, id: i + 1 + offset, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }));
  };

  const getLeagueData = (name, code) => {
    const t2 = baseTeam(code, true);
    return {
      type: 'league', name, 
      teams: baseTeam(code), matchday: 0, history: [], showWinner: false, 
      teams2: t2, matchday2: 0, history2: [], showWinner2: false,
      userTeamId: 1, userTeamId2: t2[0]?.id || 21, disqualified: false,
      promotionsLogs: null,
      previousStandings: null, previousStandings2: null

    };
  };

  return {
    'L1': getLeagueData('Liga Española', 'ES'),
    'L2': getLeagueData('Liga Italiana', 'IT'),
    'L3': getLeagueData('Liga Inglesa', 'EN'),
    'L4': getLeagueData('Liga Alemana', 'DE'),
    'L5': getLeagueData('Liga Holandesa', 'NL'),
    'L6': getLeagueData('Liga Francesa', 'FR'),
    'L7': getLeagueData('Miscelánea', 'MI'),
    'C1': { type: 'cup', name: 'Champions League', teams: [], matchday: 0, history: [], userTeamId: 1, showWinner: false, phase: 'groups', bracket: null, disqualified: false },
    'C2': { type: 'cup', name: 'Copa del Mundo', teams: [], matchday: 0, history: [], userTeamId: 1, showWinner: false, phase: 'groups', bracket: null, disqualified: false }
  };
};

// Snapshot independiente de una tabla final (posición, equipo, PJ, PG, PE, PP, GF, GC, DG, Pts)
const buildStandingsSnapshot = (teams) => {
  if (!Array.isArray(teams) || teams.length === 0) return null;
  return [...teams]
    .sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf)
    .map((t, i) => ({
      pos: i + 1,
      id: t.id, name: t.name, color1: t.color1, color2: t.color2, isFlag: t.isFlag, league: t.league,
      att: t.att, opp: t.opp, def: t.def,
      p: t.p, w: t.w, d: t.d, l: t.l, gf: t.gf, ga: t.ga, dg: t.gf - t.ga, pts: t.pts
    }));
};

const isLeagueFinished = (comp) => {
  if (!comp || !Array.isArray(comp.teams) || comp.teams.length < 2) return false;
  const totalRounds = (comp.teams.length - 1) * 2;
  return comp.showWinner === true || (comp.matchday || 0) >= totalRounds;
};

// ==========================================
// 2.b TEMPORADA GLOBAL / JORNADA GLOBAL
// ==========================================
// Cada liga conserva su propio calendario (18 equipos = 34 jornadas, 20 = 38),
// pero todas comparten el mismo "reloj" de temporada: la jornada global.
const LEAGUE_IDS = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'];
const SEASON_KEY = `${APP_ID}_season`;
const DEFAULT_SEASON_STATE = { season: 1, globalMatchday: 1, phase: 'leagues' as 'leagues' | 'champions' };

// Jornadas totales de una división según su número de equipos (ida y vuelta)
const divTotalRounds = (teams) =>
  Array.isArray(teams) && teams.length >= 2 && teams.length % 2 === 0 ? (teams.length - 1) * 2 : 0;

// Jornadas totales de la liga (la división más larga define su calendario)
const leagueTotalRounds = (comp) => Math.max(divTotalRounds(comp?.teams), divTotalRounds(comp?.teams2));

// ¿Esta división debe todavía resolver partidos para llegar a la jornada global?
const divPendingAt = (teams, matchday, globalMatchday) => {
  const total = divTotalRounds(teams);
  if (!total) return false;
  const md = matchday || 0;
  return md < total && md < globalMatchday;
};

const leaguePendingAt = (comp, globalMatchday) =>
  !!comp && comp.type === 'league' &&
  (divPendingAt(comp.teams, comp.matchday, globalMatchday) ||
   divPendingAt(comp.teams2, comp.matchday2, globalMatchday));

// La liga ya completó su propio calendario (🏁 Temporada finalizada)
const leagueSeasonOver = (comp) => {
  if (!comp || comp.type !== 'league') return true;
  const r1 = divTotalRounds(comp.teams);
  const r2 = divTotalRounds(comp.teams2);
  if (!r1 && !r2) return true;
  return (comp.matchday || 0) >= r1 && (comp.matchday2 || 0) >= r2;
};

// Progreso mostrable de una liga dentro de la temporada global
const leagueProgressLabel = (comp, globalMatchday) => {
  const total = leagueTotalRounds(comp);
  if (!total) return 'No Inicializada';
  if (leagueSeasonOver(comp)) return '🏁 Temporada finalizada';
  return `Jornada ${Math.min(globalMatchday, total)}/${total}`;
};

// Ascensos / descensos de una liga (lógica original, extraída para reutilizarla
// también al iniciar la nueva temporada global de todas las ligas).
const computeLeagueNewSeason = (comp) => {
  if (!comp || comp.type !== 'league') return null;
  const sorted1 = [...(comp.teams || [])].sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));
  const sorted2 = [...(comp.teams2 || [])].sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));
  const resetStats = (t) => ({ ...t, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 });
  if (sorted1.length < 4 || sorted2.length < 4) {
    return { teams: sorted1.map(resetStats), teams2: sorted2.map(resetStats) };
  }

  const bottom3 = sorted1.slice(-3);
  const top3 = sorted2.slice(0, 3);

  // Mecánica original de herencia de stats al ascender/descender
  const origStats = bottom3.map(t => ({ att: t.att, opp: t.opp, def: t.def }));
  const boostedRelegated = [
    { ...bottom3[0], att: 5, opp: 5, def: 3 },
    { ...bottom3[1], att: 4, opp: 4, def: 4 },
    { ...bottom3[2], att: 3, opp: 4, def: 3 }
  ];
  const adjustedPromoted = [
    { ...top3[0], att: origStats[0].att, opp: origStats[0].opp, def: origStats[0].def },
    { ...top3[1], att: origStats[1].att, opp: origStats[1].opp, def: origStats[1].def },
    { ...top3[2], att: origStats[2].att, opp: origStats[2].opp, def: origStats[2].def }
  ];

  const remaining1 = sorted1.slice(0, -3).map(resetStats);
  const remaining2 = sorted2.slice(3).map(resetStats);

  return {
    teams: [...remaining1, ...adjustedPromoted.map(resetStats)],
    teams2: [...remaining2, ...boostedRelegated.map(resetStats)]
  };
};

// MODIFICADO: CL se construye con jerarquía de fuentes:
// 1) clasificación real final de la liga terminada
// 2) previousStandings (última tabla final guardada)
// 3) respaldo simulado/provisional (sistema anterior)
// 4) sorteo de respaldo para completar 32
const buildCLPool = (compsState, forceNames = []) => {
  const getSource = (compKey) => {
    const comp = compsState?.[compKey];
    if (!comp || !Array.isArray(comp.teams) || comp.teams.length === 0) return null;
    // PRIORIDAD 1: clasificación real de la competición terminada
    if (isLeagueFinished(comp)) {
      return { origin: 'real', table: buildStandingsSnapshot(comp.teams), teams: comp.teams };
    }
    // PRIORIDAD 2: previousStandings
    if (Array.isArray(comp.previousStandings) && comp.previousStandings.length > 0) {
      return { origin: 'previous', table: comp.previousStandings, teams: comp.teams };
    }
    // PRIORIDAD 3: respaldo provisional (por fuerza deportiva + azar)
    const sim = [...comp.teams].sort((a, b) => (b.att + b.opp + b.def) - (a.att + a.opp + a.def));
    return { origin: 'sim', table: buildStandingsSnapshot(sim.map((t, i) => ({ ...t, pts: 1000 - i }))), teams: comp.teams };
  };

  const pull = (compKey, guaranteed, extra) => {
    const src = getSource(compKey);
    if (!src) return [];
    // Resolvemos cada fila de la tabla contra el equipo vivo actual (por id, si no por nombre)
    const resolve = (row) => {
      const live = src.teams.find(t => t.id === row.id) || src.teams.find(t => t.name === row.name);
      const base = live || row;
      return { ...base, clOrigin: src.origin, clProvisional: src.origin === 'sim' };
    };
    const ordered = src.table.map(resolve);
    const top = ordered.slice(0, guaranteed);
    const rest = [...ordered.slice(guaranteed, guaranteed + 6)].sort(() => Math.random() - 0.5).slice(0, extra);
    return [...top, ...rest];
  };

  let pool = [
    ...pull('L1', 3, 2), ...pull('L3', 3, 2), ...pull('L4', 3, 2), ...pull('L2', 3, 2),
    ...pull('L6', 3, 1), ...pull('L5', 3, 1), ...pull('L7', 3, 1),
  ];

  // Sin duplicados por nombre
  const seen = new Set();
  pool = pool.filter(t => { if (!t || seen.has(t.name)) return false; seen.add(t.name); return true; });

  // PRIORIDAD 4: sorteo de respaldo hasta completar exactamente 32
  if (pool.length < 32) {
    const eligible = [];
    ['L1','L3','L4','L2','L6','L5','L7'].forEach(k => {
      const comp = compsState?.[k];
      if (comp && Array.isArray(comp.teams)) comp.teams.forEach(t => { if (!seen.has(t.name)) eligible.push({ ...t, clOrigin: 'draw', clProvisional: true }); });
    });
    eligible.sort(() => Math.random() - 0.5);
    while (pool.length < 32 && eligible.length > 0) {
      const t = eligible.pop();
      if (!seen.has(t.name)) { seen.add(t.name); pool.push(t); }
    }
  }

  pool = pool.slice(0, 32);

  // PRIORIDAD 5: plazas garantizadas (p.ej. el club del modo carrera que se ha
  // clasificado). Si no entró en el sorteo, ocupa el sitio del más débil.
  (forceNames || []).forEach(name => {
    if (!name || pool.some(t => t.name === name)) return;
    let forced = null;
    ['L1','L2','L3','L4','L5','L6','L7'].forEach(k => {
      const comp = compsState?.[k];
      if (!forced && comp && Array.isArray(comp.teams)) {
        const found = comp.teams.find(t => t.name === name);
        if (found) forced = { ...found, clOrigin: 'career', clProvisional: false };
      }
    });
    if (!forced) return;
    const weakestIdx = pool.reduce((worst, t, i) =>
      (t.att + t.opp + t.def) < (pool[worst].att + pool[worst].opp + pool[worst].def) ? i : worst, 0);
    pool[weakestIdx] = forced;
  });

  return pool.slice(0, 32);
};


const drawKnockoutGroups = (pool, isWC, randomize) => {
  let groups = Array.from({length: 8}, () => []);
  const sortedPool = [...pool].sort((a, b) => (b.att + b.opp + b.def) - (a.att + a.opp + a.def));
  let pots = [sortedPool.slice(0, 8), sortedPool.slice(8, 16), sortedPool.slice(16, 24), sortedPool.slice(24, 32)];

  if (randomize) pots = pots.map(pot => [...pot].sort(() => Math.random() - 0.5));

  if (isWC) {
     let steps = 0;
     const solve = (potIdx, groupIdx) => {
        if (++steps > 2500) return false;
        if (potIdx === 4) return true;
        if (groupIdx === 8) return solve(potIdx + 1, 0);

        for (let i = 0; i < pots[potIdx].length; i++) {
           const team = pots[potIdx][i];
           if (team.used) continue;

           const regionCount = groups[groupIdx].filter(t => t.region === team.region).length;
           let conflict = false;
           if (team.region === 'EU' && regionCount >= 2) conflict = true;
           if (team.region !== 'EU' && regionCount >= 1) conflict = true;

           if (!conflict) {
              team.used = true;
              groups[groupIdx].push(team);
              if (solve(potIdx, groupIdx + 1)) return true;
              groups[groupIdx].pop();
              team.used = false;
           }
        }
        return false;
     };
     let workingPots = pots.map(pot => pot.map(t => ({...t, used: false})));
     pots = workingPots;
     let success = solve(0, 0);
     if (!success) groups = Array.from({length: 8}, (_, i) => [pots[0][i], pots[1][i], pots[2][i], pots[3][i]].filter(Boolean));
  } else {
     let steps = 0;
     const solve = (potIdx, groupIdx) => {
        if (++steps > 2500) return false;
        if (potIdx === 4) return true;
        if (groupIdx === 8) return solve(potIdx + 1, 0);

        for (let i = 0; i < pots[potIdx].length; i++) {
           const team = pots[potIdx][i];
           if (team.used) continue;

           const sameLeagueCount = groups[groupIdx].filter(t => t.league === team.league).length;
           if (sameLeagueCount === 0) {
              team.used = true;
              groups[groupIdx].push(team);
              if (solve(potIdx, groupIdx + 1)) return true;
              groups[groupIdx].pop();
              team.used = false;
           }
        }
        return false;
     };
     let workingPots = pots.map(pot => pot.map(t => ({...t, used: false})));
     pots = workingPots;
     let success = solve(0, 0);
     if (!success) groups = Array.from({length: 8}, (_, i) => [pots[0][i], pots[1][i], pots[2][i], pots[3][i]].filter(Boolean));
  }

  const formattedGroups = groups.map((g, i) => ({ name: 'Grupo ' + String.fromCharCode(65 + i), teamIds: g.map(t => t.id) }));
  return { teams: pool, groups: formattedGroups, matchday: 0, history: [], phase: 'groups', showWinner: false, disqualified: false, userTeamId: pool[0].id, bracket: null,
    participantsFrozen: true, participantsLockedAt: Date.now(),
    participantsSources: pool.map(t => ({ name: t.name, origin: t.clOrigin || 'preset', provisional: !!t.clProvisional })) };
};



const getAutoFillData = (compId, compsState, forceNames = []) => {
  const isWC = compId === 'C2';
  let pool = isWC ? [...PRESETS.WC] : buildCLPool(compsState, forceNames);
  pool = pool.map((t, i) => ({ ...t, id: i + 1, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }));
  return drawKnockoutGroups(pool, isWC, false);
};

const getShuffleData = (compId, compsState) => {
  const isWC = compId === 'C2';
  let pool = isWC ? [...PRESETS.WC] : buildCLPool(compsState);
  pool = pool.map((t, i) => ({ ...t, id: i + 1, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }));
  return drawKnockoutGroups(pool, isWC, true);
};


const generateKnockoutBrackets = (comp) => {
  if (!comp || !Array.isArray(comp.groups) || !Array.isArray(comp.teams)) return null;
  const groupResults = comp.groups.map(g => {
    const teams = comp.teams.filter(t => g.teamIds && g.teamIds.includes(t.id)).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));
    return { first: teams[0], second: teams[1] };
  });

  const numGroups = groupResults.length;
  const bracket = { Octavos: [], Cuartos: [], Semis: [], Final: [{ id: 'F1', hId: null, aId: null, sh: null, sa: null, penH: null, penA: null, sh2: null, sa2: null }] };

  if (numGroups === 8) {
    for (let i = 0; i < 8; i += 2) {
      if (groupResults[i] && groupResults[i+1]) {
        bracket.Octavos.push({ id: 'O'+(i+1), hId: groupResults[i].first?.id, aId: groupResults[i+1].second?.id, sh: null, sa: null, penH: null, penA: null, sh2: null, sa2: null });
        bracket.Octavos.push({ id: 'O'+(i+2), hId: groupResults[i+1].first?.id, aId: groupResults[i].second?.id, sh: null, sa: null, penH: null, penA: null, sh2: null, sa2: null });
      }
    }
    bracket.Cuartos = Array(4).fill(null).map((_, i) => ({ id: 'Q'+(i+1), hId: null, aId: null, sh: null, sa: null, penH: null, penA: null, sh2: null, sa2: null }));
    bracket.Semis = Array(2).fill(null).map((_, i) => ({ id: 'S'+(i+1), hId: null, aId: null, sh: null, sa: null, penH: null, penA: null, sh2: null, sa2: null }));
  } else if (numGroups === 4) {
    for (let i = 0; i < 4; i += 2) {
      if (groupResults[i] && groupResults[i+1]) {
        bracket.Cuartos.push({ id: 'Q'+(i+1), hId: groupResults[i].first?.id, aId: groupResults[i+1].second?.id, sh: null, sa: null, penH: null, penA: null, sh2: null, sa2: null });
        bracket.Cuartos.push({ id: 'Q'+(i+2), hId: groupResults[i+1].first?.id, aId: groupResults[i].second?.id, sh: null, sa: null, penH: null, penA: null, sh2: null, sa2: null });
      }
    }
    bracket.Semis = Array(2).fill(null).map((_, i) => ({ id: 'S'+(i+1), hId: null, aId: null, sh: null, sa: null, penH: null, penA: null, sh2: null, sa2: null }));
    bracket.Octavos = null;
  }
  return bracket;
};

const generateLeagueSchedule = (teams, twoLegged = true) => {
  if (!Array.isArray(teams)) return [];
  const n = teams.length;
  if (n % 2 !== 0) return [];
  const teamIds = teams.map(t => t.id);
  const rounds = [];
  const totalRounds = twoLegged ? (n - 1) * 2 : (n - 1);

  for (let j = 0; j < totalRounds; j++) {
    const round = [];
    const isReturn = j >= (n - 1);
    const r = isReturn ? j - (n - 1) : j;

    for (let i = 0; i < n / 2; i++) {
      const home = i === 0 ? teamIds[n - 1] : teamIds[(r + i) % (n - 1)];
      const away = teamIds[(n - 1 - i + r) % (n - 1)];
      if (isReturn) round.push({ homeId: away, awayId: home });
      else round.push({ homeId: home, awayId: away });
    }
    rounds.push(round);
  }
  return rounds;
};


// ==========================================
// 3. COMPONENTES ATÓMICOS
// ==========================================
// [Se mantienen intactos]

// Últimos 5 partidos de un equipo (más antiguo -> más reciente).
// El historial se guarda con la jornada más reciente al inicio del array.
const getLast5 = (teamId: any, history: any[]) => {
  if (!Array.isArray(history) || !history.length) return [];
  const out: string[] = [];
  for (let i = 0; i < history.length && out.length < 5; i++) {
    const dayResults = history[i]?.results;
    if (!Array.isArray(dayResults)) continue;
    // Puede haber más de un partido del equipo en la misma entrada (ida/vuelta)
    const matches = dayResults.filter((r: any) => r && (r.hId === teamId || r.aId === teamId));
    for (let j = matches.length - 1; j >= 0 && out.length < 5; j--) {
      const res = matches[j];
      if (res.sh == null || res.sa == null) continue;
      const isHome = res.hId === teamId;
      const gf = isHome ? res.sh : res.sa;
      const ga = isHome ? res.sa : res.sh;
      let r = gf > ga ? 'W' : gf === ga ? 'D' : 'L';
      if (gf === ga && res.penH != null && res.penA != null) {
        const pf = isHome ? res.penH : res.penA;
        const pa = isHome ? res.penA : res.penH;
        if (pf !== pa) r = pf > pa ? 'W' : 'L';
      }
      out.push(r);
    }
  }
  return out.reverse();
};


const FormBadges = ({ form }: { form: string[] }) => {
  if (!form.length) return <span className='text-[9px] font-bold text-slate-600'>—</span>;
  return (
    <div className='flex items-center justify-center gap-1'>
      {form.map((r, i) => (
        <span
          key={i}
          title={r === 'W' ? 'Victoria' : r === 'D' ? 'Empate' : 'Derrota'}
          className={`w-4 h-4 rounded-md flex items-center justify-center text-[7px] font-black text-white ${r === 'W' ? 'bg-emerald-500' : r === 'D' ? 'bg-slate-500' : 'bg-red-500'}`}
        >{r === 'W' ? 'V' : r === 'D' ? 'E' : 'D'}</span>
      ))}
    </div>
  );
};


const Shield = ({ color1, color2, initial, size = 'md', isFlag = false }) => {
  const dims = size === 'lg' ? 'w-20 h-24' : size === 'sm' ? 'w-8 h-10' : size === 'xs' ? 'w-5 h-6' : 'w-12 h-14';
  const imgDims = size === 'lg' ? 'w-20 h-14' : size === 'sm' ? 'w-8 h-6' : size === 'xs' ? 'w-5 h-4' : 'w-12 h-8';
  const fontSize = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-[10px]' : size === 'xs' ? 'text-[8px]' : 'text-sm';
  const safeInitial = initial ? initial[0] : '?';

  if (isFlag) {
    const code = getCountryCode(initial);
    if (code) {
      return (
        <div className={`${imgDims} relative overflow-hidden shadow-md rounded-sm border border-white/10 shrink-0`}>
          <img src={`https://flagcdn.com/${code}.svg`} alt={initial} className='w-full h-full object-cover' onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
      );
    }
    return (
      <div className={`${dims} relative overflow-hidden shadow-md rounded-lg border border-white/10 shrink-0`}>
        <div className='absolute inset-0 flex flex-col'>
          <div className='h-1/2 w-full' style={{ backgroundColor: color1 || '#333' }}></div>
          <div className='h-1/2 w-full' style={{ backgroundColor: color2 || '#666' }}></div>
        </div>
        <div className='absolute inset-0 flex items-center justify-center'>
          <span className={`${fontSize} font-black text-white mix-blend-difference italic drop-shadow-md`}>{safeInitial}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${dims} relative overflow-hidden shadow-md shrink-0`} style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 80%, 50% 100%, 0% 80%)' }}>
      <div className='absolute inset-0 flex'>
        <div className='w-1/2 h-full' style={{ backgroundColor: color1 || '#333' }}></div>
        <div className='w-1/2 h-full' style={{ backgroundColor: color2 || '#666' }}></div>
      </div>
      <div className='absolute inset-0 flex items-center justify-center'>
        <span className={`${fontSize} font-black text-white mix-blend-difference italic drop-shadow-md`}>{safeInitial}</span>
      </div>
    </div>
  );
};

/* ─────────────── Historial de Campeones y Récords ─────────────── */

export interface ChampionRecord {
  season: number;
  champion: {
    id: any; name: string; pts: number; gf: number; ga: number;
    color1?: string; color2?: string; isFlag?: boolean;
  };
  runnerUp: { id: any; name: string; pts: number } | null;
  records: {
    topScoring: { name: string; value: number };
    bestDefense: { name: string; value: number };
    bestGoalDiff: { name: string; value: number };
    mostWins: { name: string; value: number };
  };
}

const leaderBy = (teams: any[], pick: (t: any) => number, mode: 'max' | 'min' = 'max') => {
  if (!Array.isArray(teams) || !teams.length) return { name: '—', value: 0 };
  const best = teams.reduce((acc, t) =>
    mode === 'max' ? (pick(t) > pick(acc) ? t : acc) : (pick(t) < pick(acc) ? t : acc)
  , teams[0]);
  return { name: best?.name || '—', value: pick(best) || 0 };
};

// Construye el resumen (campeón + récords) de una división concreta
const buildSeasonRecord = (teams: any[], currentSeason: number): ChampionRecord | null => {
  if (!Array.isArray(teams) || teams.length < 2) return null;
  const table = [...teams].sort(
    (a, b) => (b.pts || 0) - (a.pts || 0)
      || ((b.gf || 0) - (b.ga || 0)) - ((a.gf || 0) - (a.ga || 0))
      || (b.gf || 0) - (a.gf || 0)
  );
  const [champ, second] = table;
  if (!champ) return null;

  return {
    season: currentSeason,
    champion: {
      id: champ.id, name: champ.name, pts: champ.pts || 0,
      gf: champ.gf || 0, ga: champ.ga || 0,
      color1: champ.color1, color2: champ.color2, isFlag: champ.isFlag
    },
    runnerUp: second ? { id: second.id, name: second.name, pts: second.pts || 0 } : null,
    records: {
      topScoring: leaderBy(teams, t => t.gf || 0, 'max'),
      bestDefense: leaderBy(teams, t => t.ga || 0, 'min'),
      bestGoalDiff: leaderBy(teams, t => (t.gf || 0) - (t.ga || 0), 'max'),
      mostWins: leaderBy(teams, t => t.w || 0, 'max')
    }
  };
};

const pushRecord = (record: ChampionRecord | null, history?: ChampionRecord[]) =>
  record ? [record, ...(history || [])].slice(0, 10) : (history || []);

// Registra el resumen de la temporada de AMBAS divisiones y devuelve la liga actualizada
const registerSeasonSummary = (comp: any, currentSeason: number) => {
  if (!comp) return comp;
  const r1 = buildSeasonRecord(comp.teams, currentSeason);
  const r2 = buildSeasonRecord(comp.teams2, currentSeason);
  if (!r1 && !r2) return comp;
  return {
    ...comp,
    championsHistory: pushRecord(r1, comp.championsHistory),
    championsHistory2: pushRecord(r2, comp.championsHistory2)
  };
};

const ChampionsHistoryModal = ({ championsHistory = [], onClose, title = 'Palmarés', compId = null, div = 1, showTopWinners = false }: { championsHistory?: ChampionRecord[]; onClose?: () => void; title?: string; compId?: string | null; div?: number; showTopWinners?: boolean }) => {
  const [tab, setTab] = useState<'history' | 'winners'>('history');
  const canShowWinners = showTopWinners && div === 1 && !!compId;

  return (
  <div className='fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3' onClick={onClose}>
    <div onClick={e => e.stopPropagation()} className='w-full max-w-md bg-slate-900 border border-amber-400/30 rounded-[1.75rem] shadow-2xl overflow-hidden'>
      <div className='flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10 bg-gradient-to-r from-amber-500/20 to-transparent'>
        <div className='flex min-w-0 items-center gap-2'>
          <Trophy size={16} className='shrink-0 text-amber-400' />
          <h3 className='truncate text-sm font-black uppercase italic text-amber-300'>{title}</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className='shrink-0 text-[9px] font-black uppercase tracking-widest text-slate-300 bg-white/10 px-3 py-1.5 rounded-lg active:scale-95'>Cerrar</button>
        )}
      </div>

      {canShowWinners && (
        <div className='grid grid-cols-2 gap-2 px-3 pt-3'>
          <button onClick={() => setTab('history')} className={`rounded-xl border px-2 py-2 text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all ${tab === 'history' ? 'border-amber-400/40 bg-amber-500/20 text-amber-200' : 'border-white/10 bg-white/5 text-slate-400'}`}>
            Últimos 10 campeones
          </button>
          <button onClick={() => setTab('winners')} className={`flex items-center justify-center gap-1 rounded-xl border px-2 py-2 text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all ${tab === 'winners' ? 'border-amber-400/40 bg-amber-500/20 text-amber-200' : 'border-white/10 bg-white/5 text-slate-400'}`}>
            <Star size={10} className={tab === 'winners' ? 'fill-amber-400 text-amber-400' : ''} /> Máximos ganadores
          </button>
        </div>
      )}

      {canShowWinners && tab === 'winners' ? (
        <div className='max-h-[70vh] overflow-y-auto p-3'>
          <TopWinnersTable compId={compId as string} div={div} records={championsHistory} emptyLabel='Aún no se ha ganado ningún título en esta liga.' />
        </div>
      ) : (
      <div className='max-h-[70vh] overflow-y-auto p-3 space-y-2.5'>
        {!championsHistory.length ? (
          <p className='py-10 text-center text-[11px] font-bold italic text-slate-500'>
            El palmarés está esperando a su primer campeón.
          </p>
        ) : championsHistory.map((r, i) => (
          <div key={`${r.season}-${i}`} className='rounded-2xl border border-amber-400/20 bg-slate-950/70 p-3'>
            <div className='grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3'>
              <Shield color1={r.champion.color1} color2={r.champion.color2} initial={r.champion.name} size='sm' isFlag={r.champion.isFlag} />
              <div className='min-w-0'>
                <p className='text-[8px] font-black uppercase tracking-widest text-amber-400'>Temporada {r.season}</p>
                <p className='truncate text-[13px] font-black uppercase italic text-white'>{r.champion.name}</p>
                {r.runnerUp && (
                  <p className='truncate text-[9px] font-bold text-slate-400'>2º {r.runnerUp.name} · {r.runnerUp.pts} pts</p>
                )}
              </div>
              <span className='shrink-0 rounded-lg border border-amber-400/30 bg-amber-500/15 px-2 py-1 text-[10px] font-black text-amber-300'>{r.champion.pts} PTS</span>
            </div>

            <div className='mt-2.5 grid grid-cols-2 gap-2'>
              <div className='rounded-xl bg-white/5 px-2 py-1.5'>
                <p className='text-[7px] font-black uppercase tracking-widest text-slate-400'>Máx. goleador (equipo)</p>
                <p className='truncate text-[10px] font-black text-emerald-400'>{r.records.topScoring.name} · {r.records.topScoring.value} GF</p>
              </div>
              <div className='rounded-xl bg-white/5 px-2 py-1.5'>
                <p className='text-[7px] font-black uppercase tracking-widest text-slate-400'>Mejor defensa</p>
                <p className='truncate text-[10px] font-black text-sky-400'>{r.records.bestDefense.name} · {r.records.bestDefense.value} GC</p>
              </div>
              <div className='rounded-xl bg-white/5 px-2 py-1.5'>
                <p className='text-[7px] font-black uppercase tracking-widest text-slate-400'>Mejor DG</p>
                <p className='truncate text-[10px] font-black text-amber-300'>{r.records.bestGoalDiff.name} · {r.records.bestGoalDiff.value > 0 ? '+' : ''}{r.records.bestGoalDiff.value}</p>
              </div>
              <div className='rounded-xl bg-white/5 px-2 py-1.5'>
                <p className='text-[7px] font-black uppercase tracking-widest text-slate-400'>Más victorias</p>
                <p className='truncate text-[10px] font-black text-fuchsia-300'>{r.records.mostWins.name} · {r.records.mostWins.value}V</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  </div>
  );
};



const DieIcon = ({ value, className }) => {
  const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  const Icon = icons[value - 1] || Dices;
  return <Icon className={className} strokeWidth={1.5} />;
};

const Confetti = () => (
  <div className='fixed inset-0 pointer-events-none z-[55] overflow-hidden'>
    {[...Array(60)].map((_, i) => (
      <div 
        key={i} className='absolute animate-bounce'
        style={{
          left: (Math.random() * 100) + '%', top: '-10%', width: '8px', height: '8px',
          backgroundColor: ['#ffd700', '#ff0000', '#00ff00', '#0000ff', '#ffffff'][Math.floor(Math.random() * 5)],
          animation: `confetti-fall ${2 + Math.random() * 3}s linear infinite`, animationDelay: `${Math.random() * 2}s`
        }}
      />
    ))}
    <style>{`@keyframes confetti-fall { to { transform: translateY(110vh) rotate(720deg); } }`}</style>
  </div>
);

const AttrStepper = ({ label, val, min, max, onUpdate }) => (
  <div className='flex flex-col items-center bg-black/40 rounded-xl p-1.5 border border-white/10'>
    <span className='text-[7px] font-black uppercase text-slate-300 mb-1'>{label}</span>
    <div className='flex items-center gap-2 w-full justify-center'>
      <button onClick={() => onUpdate(Math.max(min, val - 1))} className='w-5 h-5 bg-slate-800/80 hover:bg-slate-700 rounded text-white text-xs font-bold active:scale-95 flex items-center justify-center transition-all'>-</button>
      <span className='text-[10px] font-black w-2 text-center text-white'>{val}</span>
      <button onClick={() => onUpdate(Math.min(max, val + 1))} className='w-5 h-5 bg-slate-800/80 hover:bg-slate-700 rounded text-white text-xs font-bold active:scale-95 flex items-center justify-center transition-all'>+</button>
    </div>
  </div>
);

const MenuButton = ({ icon, label, onClick, disabled = false, isDanger = false, isWide = false }) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`
      flex items-center justify-center p-3 rounded-2xl border transition-all 
      ${isWide ? 'flex-row gap-2' : 'flex-col'}
      ${disabled ? 'opacity-30 cursor-not-allowed bg-slate-900/20 border-white/5' : 
        isDanger ? 'bg-red-900/20 border-red-500/30 text-red-400 hover:bg-red-900/40 active:scale-95' : 
        'bg-slate-800/40 border-white/10 text-white hover:bg-slate-700/60 active:scale-95 hover:border-white/30 backdrop-blur-md'}
    `}
  >
    <div className={isWide ? 'mb-0' : 'mb-1'}>{icon}</div>
    <span className='text-[8px] font-black uppercase italic tracking-wider'>{label}</span>
  </button>
);

// ==========================================
// GENERADOR DE NOTICIAS DINÁMICAS
// ==========================================
const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

const generateNews = (teams: any[], teams2: any[], matchday: number, compType: string, compName: string, history?: any[], schedule?: any[][], cupPhase?: string) => {
  if (!teams || teams.length === 0) return [];

  const sorted = [...teams].sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));
  const sorted2 = teams2 && teams2.length > 0 ? [...teams2].sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga)) : [];
  const news: any[] = [];
  const totalTeams = sorted.length;
  const usedIds = new Set<number>();
  const totalRounds = compType === 'league' ? (totalTeams - 1) * 2 : matchday + 5;
  const progress = matchday / totalRounds;
  const phase = progress < 0.25 ? 'early' : progress < 0.55 ? 'mid' : progress < 0.8 ? 'late' : 'final';
  const jLeft = totalRounds - matchday;

  const addNews = (item: any) => {
    if (item.team) usedIds.add(item.team.id);
    news.push(item);
  };

  // Helper: calcular rachas desde historial.
  // OJO: history[0] es la jornada MÁS RECIENTE (se hace unshift al simular).
  const resultFor = (teamId: number, day: any) => {
    const res = day?.results?.find((r: any) => r.hId === teamId || r.aId === teamId);
    if (!res || res.sh === null || res.sh === undefined || res.sa === null || res.sa === undefined) return null;
    const isHome = res.hId === teamId;
    const gf = isHome ? res.sh : res.sa;
    const ga = isHome ? res.sa : res.sh;
    return { res, isHome, gf, ga, outcome: gf > ga ? 'W' : gf === ga ? 'D' : 'L' };
  };

  const getStreak = (teamId: number) => {
    if (!history || history.length === 0) return { type: 'none', count: 0, results: '' };
    const seq: string[] = []; // seq[0] = partido más reciente
    for (let i = 0; i < history.length; i++) {
      const r = resultFor(teamId, history[i]);
      if (r) seq.push(r.outcome);
    }
    if (!seq.length) return { type: 'none', count: 0, results: '' };
    const type = seq[0];
    let count = 1;
    while (count < seq.length && seq[count] === type) count++;
    // results en orden cronológico real (antiguo -> reciente), últimos 5
    const results = seq.slice(0, 5).reverse().join('');
    return { type, count, results };
  };

  // Jornada más reciente y tabla previa a esa jornada (para detectar cambios de liderato)
  const lastDay = history && history.length > 0 ? history[0] : null;
  const lastDayLabel = lastDay?.day ? (typeof lastDay.day === 'number' ? `Jornada ${lastDay.day}` : String(lastDay.day)) : `Jornada ${matchday}`;

  const buildPrevTable = () => {
    if (!lastDay?.results || compType !== 'league') return null;
    const map = new Map<number, any>();
    teams.forEach(t => map.set(t.id, {
      id: t.id, name: t.name, pts: t.pts || 0, gf: t.gf || 0, ga: t.ga || 0,
      w: t.w || 0, d: t.d || 0, l: t.l || 0
    }));
    let touched = false;
    for (const r of lastDay.results) {
      const h = map.get(r.hId); const a = map.get(r.aId);
      if (!h || !a || r.sh === null || r.sh === undefined || r.sa === null || r.sa === undefined) continue;
      touched = true;
      h.gf -= r.sh; h.ga -= r.sa; a.gf -= r.sa; a.ga -= r.sh;
      if (r.sh > r.sa) { h.pts -= 3; h.w -= 1; a.l -= 1; }
      else if (r.sa > r.sh) { a.pts -= 3; a.w -= 1; h.l -= 1; }
      else { h.pts -= 1; a.pts -= 1; h.d -= 1; a.d -= 1; }
    }
    if (!touched) return null;
    return [...map.values()].sort((x, y) => y.pts - x.pts || ((y.gf - y.ga) - (x.gf - x.ga)) || y.gf - x.gf);
  };
  const prevTable = buildPrevTable();
  const prevPos = (teamId: number) => prevTable ? prevTable.findIndex(t => t.id === teamId) + 1 : 0;

  // ============================================================
  // === LO QUE PASÓ EN LA JORNADA (prioridad cronológica máxima) ===
  // ============================================================
  const teamById = (id: number) => teams.find(t => t.id === id) || (teams2 || []).find((t: any) => t.id === id);

  if (lastDay?.results && matchday > 0) {
    const rows = lastDay.results.filter((r: any) => r.sh !== null && r.sh !== undefined && r.sa !== null && r.sa !== undefined);

    // --- ¿PERDIÓ EL LIDERATO? ---
    if (compType === 'league' && prevTable && prevTable[0] && sorted[0] && prevTable[0].id !== sorted[0].id) {
      const oldLeader = teamById(prevTable[0].id);
      const newLeader = sorted[0];
      const oldRes = resultFor(prevTable[0].id, lastDay);
      const gap = newLeader.pts - (prevTable.find(t => t.id === prevTable[0].id)?.pts ?? 0);
      if (oldLeader && !usedIds.has(newLeader.id)) {
        addNews({
          title: `🚨 ¡CAMBIO DE LÍDER! ${newLeader.name} destrona al ${oldLeader.name}`,
          desc: `${lastDayLabel}: ${oldLeader.name} pierde el liderato que tenía y ${newLeader.name} se sienta en el trono con ${newLeader.pts} pts.${oldRes ? (oldRes.outcome === 'L' ? ` El ex-líder cayó ${oldRes.gf}-${oldRes.ga} y lo pagó carísimo.` : oldRes.outcome === 'D' ? ` Un empate (${oldRes.gf}-${oldRes.ga}) le costó la punta de la tabla.` : '') : ''} ${gap > 0 ? `Ahora manda por ${gap} punto(s).` : 'Se manda por diferencia de goles: liga al milímetro.'}`,
          team: newLeader, type: 'leadChange'
        });
        addNews({
          title: `😨 ${oldLeader.name} se queda sin liderato`,
          desc: `${lastDayLabel}: el que mandaba ya no manda. ${oldLeader.name} baja al puesto ${sorted.findIndex(t => t.id === oldLeader.id) + 1} y tendrá que remar desde atrás. ${phase === 'final' ? 'Perder la punta a estas alturas puede ser definitivo.' : 'Hay tiempo para recuperarla, pero el golpe es duro.'}`,
          team: oldLeader, type: 'leaderFall'
        });
      }
    }

    // --- EL PRIMER LUGAR HA PERDIDO (aunque siga líder) ---
    const leaderIdForCheck = prevTable?.[0]?.id ?? sorted[0]?.id;
    const leaderTeam = leaderIdForCheck ? teamById(leaderIdForCheck) : null;
    const leaderRes = leaderIdForCheck ? resultFor(leaderIdForCheck, lastDay) : null;
    if (leaderTeam && leaderRes && leaderRes.outcome === 'L' && !usedIds.has(leaderTeam.id)) {
      const rivalId = leaderRes.isHome ? leaderRes.res.aId : leaderRes.res.hId;
      const rival = teamById(rivalId);
      addNews({
        title: `💥 ¡EL LÍDER CAE! ${leaderTeam.name} pierde ${leaderRes.gf}-${leaderRes.ga}${rival ? ` ante ${rival.name}` : ''}`,
        desc: `${lastDayLabel}: el primer lugar se estrella. ${rival ? `${rival.name} dio el golpe de la fecha.` : 'Derrota inesperada.'} ${sorted[1] ? `El ${sorted[1].name} está a ${Math.max(0, sorted[0].pts - sorted[1].pts)} punto(s) y no piensa perdonar.` : ''} ${phase === 'late' || phase === 'final' ? 'A estas alturas del campeonato, estas derrotas se pagan con títulos.' : 'Aviso serio para el que va arriba.'}`,
        team: leaderTeam, type: 'leaderFall'
      });
    }

    // --- DERROTAS EN PARTIDOS IMPORTANTES (choques de arriba / duelos directos) ---
    if (compType === 'league' && prevTable) {
      const topCut = Math.max(4, Math.round(totalTeams * 0.3));
      const bigLosses = rows.map((r: any) => {
        if (r.sh === r.sa) return null;
        const homeWon = r.sh > r.sa;
        const loser = teamById(homeWon ? r.aId : r.hId);
        const winner = teamById(homeWon ? r.hId : r.aId);
        if (!loser || !winner) return null;
        const pl = prevPos(loser.id); const pw = prevPos(winner.id);
        if (!pl || !pw) return null;
        const isTopClash = pl <= topCut && pw <= topCut;
        const upset = pl <= topCut && pw > totalTeams - topCut;
        if (!isTopClash && !upset) return null;
        return { loser, winner, pl, pw, isTopClash, upset, gf: homeWon ? r.sh : r.sa, ga: homeWon ? r.sa : r.sh };
      }).filter(Boolean) as any[];

      bigLosses.sort((a, b) => (a.pl + a.pw) - (b.pl + b.pw));
      bigLosses.slice(0, 2).forEach(m => {
        if (usedIds.has(m.loser.id)) return;
        const diff = m.gf - m.ga;
        if (m.upset) {
          addNews({
            title: `😱 BATACAZO: ${m.loser.name} (${m.pl}º) cae ante ${m.winner.name} (${m.pw}º)`,
            desc: `${lastDayLabel}: ${m.gf}-${m.ga}. Un tropiezo que nadie esperaba y que le puede costar la temporada al ${m.loser.name}. En el fútbol de dados no hay favoritos garantizados: el colista de hoy es el verdugo de mañana.`,
            team: m.loser, type: 'bigLoss'
          });
        } else {
          addNews({
            title: `⚔️ DUELO DIRECTO: ${m.winner.name} gana ${m.gf}-${m.ga} y ${m.loser.name} pierde puntos de oro`,
            desc: `${lastDayLabel}: choque entre ${m.pw}º y ${m.pl}º de la tabla. ${diff >= 3 ? '¡Y encima con goleada! Un golpe anímico brutal.' : 'Se decidió por detalles, como todos los partidos grandes.'} ${m.loser.name} deja escapar una oportunidad enorme en la pelea de arriba.`,
            team: m.loser, type: 'bigLoss'
          });
        }
      });
    }
  }

  // === LIDERATO ===
  if (sorted[0] && sorted[0].pts > 0) {
    const L = sorted[0];
    const gap = sorted[1] ? L.pts - sorted[1].pts : 0;
    const dg = (L.gf || 0) - (L.ga || 0);
    const streak = getStreak(L.id);
    const streakText = streak.count >= 3 && streak.type === 'W' ? ` Racha de ${streak.count} victorias consecutivas que los hace intocables.` : '';
    const opts = phase === 'early' ? [
      { title: `🏆 ${L.name} arranca mandando`, desc: `${L.pts} pts tras ${matchday} jornadas. Arranque sólido con ${L.w || 0} triunfos.${streakText} Esto recién empieza, pero marcan el ritmo.` },
      { title: `📊 Buen inicio del ${L.name}`, desc: `Líderes tras la jornada ${matchday}. ${L.w || 0} victorias y +${dg} en gol diferencia.${streakText}` },
      { title: `⭐ ${L.name} toma la delantera`, desc: `${L.pts} puntos. Es pronto, pero el mensaje es claro: vienen con todo.${streakText}` },
      { title: `👑 ${L.name} se planta en la cima`, desc: `${L.w || 0}V ${L.d || 0}E ${L.l || 0}D. La temporada empieza y ellos ya mandan.${streakText}` },
    ] : phase === 'mid' ? [
      { title: `🏆 ${L.name} domina en el ecuador`, desc: `${L.pts} pts a mitad de temporada. ${gap > 3 ? `Ventaja de ${gap} sobre el segundo, colchón cómodo.` : 'Ventaja corta, pero el liderato es suyo.'}${streakText}` },
      { title: `📈 ${L.name} consolida a medio campeonato`, desc: `${L.w || 0} victorias en ${matchday} fechas. La regularidad es su arma.${streakText}` },
      { title: `💪 ${L.name} no afloja al llegar al ecuador`, desc: `+${dg} en diferencia de goles. Base sólida para la segunda vuelta.${streakText}` },
    ] : phase === 'late' ? [
      { title: `🏆 ${L.name} se aferra en la recta final`, desc: `${jLeft} jornadas y ${L.pts} pts. ${gap > 3 ? `${gap} de ventaja, dependen de sí mismos.` : 'Ventaja mínima, un tropiezo cambia todo.'}${streakText}` },
      { title: `🔥 ${L.name} resiste cuando más importa`, desc: `Cada punto vale doble a estas alturas. ${L.pts} unidades y la inercia de su lado.${streakText}` },
    ] : [
      { title: `🏆 ${L.name} acaricia el título`, desc: `${L.pts} pts a ${jLeft} fechas. ${gap > 0 ? `${gap} de ventaja. Lo tienen en la mano.` : 'Empatados en puntos. Final de película.'}${streakText}` },
      { title: `👑 ${L.name} a un paso de la gloria`, desc: `${L.w || 0} victorias que pueden valer un campeonato. ${jLeft} partidos para la eternidad.${streakText}` },
    ];
    addNews({ ...pick(opts), team: L, type: 'leader' });
  }

  // === CRISIS / ÚLTIMO ===
  const lastTeam = sorted[sorted.length - 1];
  if (lastTeam && matchday > 2 && !usedIds.has(lastTeam.id)) {
    const lastStreak = getStreak(lastTeam.id);
    const loseStreak = lastStreak.count >= 3 && lastStreak.type === 'L' ? ` Llevan ${lastStreak.count} derrotas seguidas... la moral por los suelos.` : '';
    const opts = phase === 'early' ? [
      { title: `😰 Mal arranque del ${lastTeam.name}`, desc: `Últimos con ${lastTeam.pts} pts tras ${matchday} jornadas. Queda liga, pero preocupa.${loseStreak}` },
      { title: `📉 ${lastTeam.name} empieza sufriendo`, desc: `${lastTeam.l || 0} derrotas en el arranque. El técnico ya siente la presión.${loseStreak}` },
    ] : phase === 'mid' ? [
      { title: `🚨 ${lastTeam.name} en el fondo al ecuador`, desc: `${lastTeam.pts} pts a mitad de temporada. La segunda vuelta tiene que ser otra historia.${loseStreak}` },
      { title: `💔 ${lastTeam.name} no levanta cabeza`, desc: `${lastTeam.w || 0} victorias en media temporada. La reacción no llega.${loseStreak}` },
    ] : phase === 'late' ? [
      { title: `⚠️ ${lastTeam.name}: el tiempo se agota`, desc: `Últimos con ${lastTeam.pts} pts y ${jLeft} jornadas. Desesperante.${loseStreak}` },
      { title: `🆘 Cuenta regresiva para ${lastTeam.name}`, desc: `${lastTeam.l || 0} derrotas pesan. ${jLeft} partidos para el milagro.${loseStreak}` },
    ] : [
      { title: `😱 ${lastTeam.name}: últimos en la definición`, desc: `${lastTeam.pts} pts a ${jLeft} fechas. Prácticamente sentenciados.${loseStreak}` },
      { title: `🪦 Final amargo para ${lastTeam.name}`, desc: `${lastTeam.w || 0}V ${lastTeam.d || 0}E ${lastTeam.l || 0}D. Números duros cuando todo se define.${loseStreak}` },
    ];
    addNews({ ...pick(opts), team: lastTeam, type: 'crisis' });
  }

  // === RACHA EN LLAMAS (3+ victorias seguidas) ===
  if (matchday >= 3) {
    const hotTeams = sorted.filter(t => !usedIds.has(t.id) && getStreak(t.id).type === 'W' && getStreak(t.id).count >= 3);
    if (hotTeams.length > 0) {
      const hot = pick(hotTeams);
      const s = getStreak(hot.id);
      const formStr = s.results.split('').map(r => r === 'W' ? '✅' : r === 'D' ? '🟡' : '🔴').join('');
      addNews({ title: `🔥 ${hot.name} EN RACHA: ${s.count} victorias al hilo`, desc: `Forma: ${formStr}. El momentum está de su lado. Cuando un equipo entra en esta dinámica, los rivales tiemblan. ${phase === 'late' || phase === 'final' ? 'Y justo en el momento más importante de la temporada.' : 'Si mantienen este nivel, van a ser protagonistas.'}`, team: hot, type: 'momentum' });
    }
  }

  // === MOMENTUM NEGATIVO (3+ derrotas seguidas, no repetir con crisis) ===
  if (matchday >= 3) {
    const coldTeams = sorted.filter(t => !usedIds.has(t.id) && getStreak(t.id).type === 'L' && getStreak(t.id).count >= 3);
    if (coldTeams.length > 0) {
      const cold = pick(coldTeams);
      const s = getStreak(cold.id);
      const formStr = s.results.split('').map(r => r === 'W' ? '✅' : r === 'D' ? '🟡' : '🔴').join('');
      addNews({ title: `📉 ${cold.name} en caída libre: ${s.count} derrotas consecutivas`, desc: `Forma: ${formStr}. La confianza se evapora partido a partido. ${cold.pts > sorted[sorted.length - 1].pts + 3 ? 'Aún tienen colchón en la tabla, pero si no reaccionan...' : 'Y la tabla no perdona. Necesitan un golpe de timón urgente.'}`, team: cold, type: 'crisis' });
    }
  }

  // === FACTOR DADO / SUERTE ===
  if (matchday >= 2) {
    // Equipos con att bajo pero muchos goles (suerte en los dados)
    const luckyTeams = sorted.filter(t => !usedIds.has(t.id) && (t.att || 3) <= 3 && (t.gf || 0) > matchday * 1.3);
    const unluckyTeams = sorted.filter(t => !usedIds.has(t.id) && (t.att || 3) >= 4 && matchday > 0 && (t.gf || 0) < matchday * 0.7);

    if (luckyTeams.length > 0) {
      const lucky = pick(luckyTeams);
      const gpm = ((lucky.gf || 0) / matchday).toFixed(1);
      addNews({ ...pick([
        { title: `🎲 ¡Los dados sonríen al ${lucky.name}!`, desc: `ATT ${lucky.att || 3} pero ${lucky.gf} goles (${gpm}/partido). El azar les está dando la mano. En el fútbol de dados, a veces la suerte es la mejor táctica.` },
        { title: `🍀 ${lucky.name}: el factor suerte existe`, desc: `Con un ataque modesto (ATT ${lucky.att || 3}) llevan ${lucky.gf} goles. Los dados han rodado a su favor y lo están aprovechando. ¿Cuánto durará la racha?` },
        { title: `✨ La fortuna del dado sonríe al ${lucky.name}`, desc: `${lucky.gf} goles con ATT ${lucky.att || 3}. En este juego, el dado manda, y últimamente el dado quiere a este equipo.` },
      ]), team: lucky, type: 'luck' });
    } else if (unluckyTeams.length > 0) {
      const unlucky = pick(unluckyTeams);
      const gpm = ((unlucky.gf || 0) / matchday).toFixed(1);
      addNews({ ...pick([
        { title: `🎲 Los dados le dan la espalda al ${unlucky.name}`, desc: `ATT ${unlucky.att || 3} pero solo ${unlucky.gf} goles (${gpm}/partido). Tienen el potencial, pero el dado no coopera. La mala suerte también es parte del juego.` },
        { title: `😤 ${unlucky.name} pide que cambien los dados`, desc: `Con ATT ${unlucky.att || 3} esperaban más, pero solo llevan ${unlucky.gf} goles. El azar no entiende de estadísticas.` },
        { title: `🔮 El dado castiga al ${unlucky.name}`, desc: `Solo ${gpm} goles/partido con un ataque de nivel ${unlucky.att || 3}. A veces, la suerte simplemente no está de tu lado.` },
      ]), team: unlucky, type: 'luck' });
    }
  }

  // === PREVIA DE PARTIDO: DERBY / CLÁSICO / PARTIDO INTERESANTE ===
  if (schedule && schedule[matchday]) {
    const nextRound = schedule[matchday];
    let bestMatch: any = null;
    let bestScore = 0;
    let bestDerby: any = null;

    for (const m of nextRound) {
      const h = sorted.find(t => t.id === m.homeId);
      const a = sorted.find(t => t.id === m.awayId);
      if (!h || !a) continue;
      const hRank = sorted.indexOf(h);
      const aRank = sorted.indexOf(a);
      const derby = findDerby(h.name, a.name);
      let score = 0;
      if (derby) score += 15 + derby.intensity * 3; // derbys tienen máxima prioridad
      if (hRank < 4 && aRank < 4) score += 10;
      if (hRank < 2 || aRank < 2) score += 5;
      const hStreak = getStreak(h.id);
      const aStreak = getStreak(a.id);
      if (hStreak.type === 'W' && hStreak.count >= 2) score += 3;
      if (aStreak.type === 'W' && aStreak.count >= 2) score += 3;
      if (hStreak.type === 'W' && aStreak.type === 'L') score += 4;
      if (aStreak.type === 'W' && hStreak.type === 'L') score += 4;
      if (Math.abs(hRank - aRank) <= 2 && hRank < totalTeams / 2) score += 2;
      if (score > bestScore) { bestScore = score; bestMatch = { h, a, hStreak, aStreak }; bestDerby = derby; }
    }

    if (bestMatch && bestScore >= 3 && !usedIds.has(bestMatch.h.id) && !usedIds.has(bestMatch.a.id)) {
      const { h, a, hStreak, aStreak } = bestMatch;
      const hPos = sorted.indexOf(h) + 1;
      const aPos = sorted.indexOf(a) + 1;
      const hForm = hStreak.results.slice(0, 4).split('').map(r => r === 'W' ? '✅' : r === 'D' ? '🟡' : '🔴').join('');
      const aForm = aStreak.results.slice(0, 4).split('').map(r => r === 'W' ? '✅' : r === 'D' ? '🟡' : '🔴').join('');
      const formText = (hForm || aForm) ? ` Forma: ${h.name} ${hForm || '—'} vs ${aForm || '—'} ${a.name}.` : '';

      if (bestDerby) {
        // ¡ES UN DERBY O CLÁSICO!
        const d = bestDerby;
        const ptsDiff = Math.abs(h.pts - a.pts);
        const bothTop = hPos <= 5 && aPos <= 5;
        const titleRace = ptsDiff <= 6 && bothTop;
        const cupContext = compType !== 'league';

        const derbyOpts = [
          { title: `${d.emoji} ¡${d.name}! ${h.name} vs ${a.name}`, desc: `¡SE VIENE EL PARTIDO MÁS ESPERADO! ${d.name} en la jornada ${matchday + 1}. ${titleRace ? `¡Y con pelea por el título! Solo ${ptsDiff} puntos separan a estos rivales en la tabla.` : `Cuando estos dos se enfrentan, la tabla no importa. Es puro orgullo, pura rivalidad.`}${formText} ¡No hay favoritos en un derby!` },
          { title: `${d.emoji} ALERTA DERBY: ${d.name} — J${matchday + 1}`, desc: `${h.name} (${hPos}º) recibe al ${a.name} (${aPos}º). ${d.intensity >= 5 ? 'El partido más caliente del calendario. La rivalidad se siente en cada rincón.' : 'Un clásico que siempre da espectáculo.'} ${hStreak.count >= 3 && hStreak.type === 'W' ? `${h.name} llega con ${hStreak.count} victorias seguidas, ¿lo notarán los rivales?` : aStreak.count >= 3 && aStreak.type === 'W' ? `${a.name} viene en racha de ${aStreak.count} triunfos. Peligro.` : 'Todo puede pasar.'}${formText}` },
          { title: `${d.emoji} ${d.name}: ¡LA CIUDAD TIEMBLA!`, desc: `¡${h.name} vs ${a.name}! Se paraliza todo. ${phase === 'final' ? '¡Y en la recta final de la temporada! Cada punto vale doble en un derby así.' : phase === 'late' ? 'En plena fase decisiva, un derby puede cambiar el rumbo de la temporada.' : 'La rivalidad no entiende de estadísticas ni de momentos.'} ${bothTop ? 'Ambos en la parte alta, duelo directo con implicaciones.' : 'No importa la tabla cuando suena el himno de este derby.'}${formText}` },
        ];
        if (cupContext) {
          derbyOpts.push({ title: `${d.emoji} ¡${d.name} EN ELIMINATORIA!`, desc: `¡INCREÍBLE! El sorteo ha emparejado a ${h.name} y ${a.name} en la ${compName}. ¡${d.name} en formato de copa, sin red, sin margen de error! El que pierda, a casa. El que gane, leyenda. ¡Esto es de película!` });
        }
        addNews({ ...pick(derbyOpts), team: h, type: 'derby' });
      } else if (hPos <= 3 && aPos <= 3) {
        addNews({ ...pick([
          { title: `🔜 PREVIA: ${h.name} vs ${a.name} — ¡Duelo de titanes!`, desc: `¡${hPos}º contra ${aPos}º! Un choque que puede definir el campeonato. ${h.pts} pts vs ${a.pts} pts.${formText} Jornada ${matchday + 1}. Esto es lo que los aficionados esperan. ¡Imperdible!` },
          { title: `⚡ ¡PARTIDAZO! ${h.name} recibe al ${a.name}`, desc: `Dos colosos frente a frente en la jornada ${matchday + 1}. ${Math.abs(h.pts - a.pts) <= 3 ? '¡Separados por nada! El que gane se lleva mucho más que 3 puntos.' : 'Ambos en la élite de la tabla.'}${formText} El ambiente va a ser ELÉCTRICO.` },
        ]), team: h, type: 'preview' });
      } else {
        const ptsDiff = Math.abs(h.pts - a.pts);
        addNews({ ...pick([
          { title: `🔜 PREVIA J${matchday + 1}: ${h.name} vs ${a.name}`, desc: `${hPos}º vs ${aPos}º. ${hStreak.count >= 2 && hStreak.type === 'W' ? `${h.name} llega enrachado.` : aStreak.count >= 2 && aStreak.type === 'W' ? `${a.name} llega con el viento a favor.` : 'Ambos necesitan los tres puntos.'}${formText}` },
          { title: `📋 Ojo a la jornada ${matchday + 1}: ${h.name} - ${a.name}`, desc: `Cruce interesante en la próxima fecha.${formText} ${ptsDiff <= 3 ? 'Separados por poco en la tabla, cada punto cuenta.' : ''}` },
        ]), team: h, type: 'preview' });
      }
    }

    // === SEGUNDO DERBY si hay otro en la jornada ===
    if (bestDerby) {
      for (const m of nextRound) {
        const h2 = sorted.find(t => t.id === m.homeId);
        const a2 = sorted.find(t => t.id === m.awayId);
        if (!h2 || !a2 || usedIds.has(h2.id) || usedIds.has(a2.id)) continue;
        const derby2 = findDerby(h2.name, a2.name);
        if (derby2 && derby2 !== bestDerby) {
          addNews({
            title: `${derby2.emoji} ¡También se juega el ${derby2.name}!`,
            desc: `¡Jornada de derbys! ${h2.name} vs ${a2.name}. ${derby2.name} en la misma fecha. Cuando la rivalidad se multiplica, la emoción se desborda.`,
            team: h2, type: 'derby'
          });
          break;
        }
      }
    }
  }

  // === DERBY JUGADO (revisar último partido del historial) ===
  if (lastDay && matchday > 0) {
    if (lastDay?.results) {
      for (const res of lastDay.results) {
        const hTeam = sorted.find(t => t.id === res.hId);
        const aTeam = sorted.find(t => t.id === res.aId);
        if (!hTeam || !aTeam || usedIds.has(hTeam.id) || usedIds.has(aTeam.id)) continue;
        const derby = findDerby(hTeam.name, aTeam.name);
        if (derby) {
          const scoreLine = `${res.sh}-${res.sa}`;
          const winner = res.sh > res.sa ? hTeam : res.sa > res.sh ? aTeam : null;
          const loser = res.sh > res.sa ? aTeam : res.sa > res.sh ? hTeam : null;
          const goalDiff = Math.abs(res.sh - res.sa);
          if (winner) {
            addNews({
              title: `${derby.emoji} ¡${winner.name} SE LLEVA EL ${derby.name.toUpperCase()}! (${scoreLine})`,
              desc: `${goalDiff >= 3 ? `¡GOLEADA HISTÓRICA! ${winner.name} destroza al ${loser!.name} por ${scoreLine}. Una humillación que tardará en olvidarse.` : goalDiff === 1 ? `¡Victoria agónica! ${winner.name} saca adelante el derby por la mínima. ${loser!.name} se queda con la miel en los labios.` : `${winner.name} se impone con autoridad. El ${derby.name} tiene dueño... por ahora.`} ¡Los aficionados del ${winner.name} estallan de alegría!`,
              team: winner, type: 'derby'
            });
          } else {
            addNews({
              title: `${derby.emoji} ${derby.name}: ¡EMPATE ÉPICO! (${scoreLine})`,
              desc: `${res.sh === 0 ? `Sin goles pero con MUCHA intensidad. ${hTeam.name} y ${aTeam.name} se neutralizan en un ${derby.name} táctico y tenso.` : `¡${res.sh} goles por lado! ${derby.name} de ida y vuelta donde ninguno quiso ceder. Punto que puede saber a poco para ambos.`} La rivalidad sigue más viva que nunca.`,
              team: hTeam, type: 'derby'
            });
          }
          break; // solo 1 noticia de derby jugado
        }
      }
    }
  }

  // === ZONA DE DESCENSO ===
  if (compType === 'league' && totalTeams >= 18 && matchday > 1) {
    const relegTeam = pick(sorted.slice(-3).filter(t => !usedIds.has(t.id)));
    if (relegTeam) {
      const rStreak = getStreak(relegTeam.id);
      const formStr = rStreak.results.slice(0, 5).split('').map(r => r === 'W' ? '✅' : r === 'D' ? '🟡' : '🔴').join('');
      const opts = phase === 'early' ? [
        { title: `⬇️ ${relegTeam.name} en zona roja`, desc: `${relegTeam.pts} pts. Forma: ${formStr || '—'}. Es temprano, pero nadie quiere acostumbrarse al fondo.` },
      ] : phase === 'mid' ? [
        { title: `⬇️ ${relegTeam.name}: media liga en descenso`, desc: `${relegTeam.pts} pts al ecuador. Forma: ${formStr || '—'}. La segunda vuelta tiene que ser otra cosa.` },
      ] : phase === 'late' ? [
        { title: `⬇️ Alarma para ${relegTeam.name}`, desc: `${jLeft} jornadas y en zona de bajada. Forma: ${formStr || '—'}. El margen se reduce cada semana.` },
        { title: `⏳ ${relegTeam.name}: cada partido es una final`, desc: `En puestos de descenso en la recta final. ${relegTeam.w || 0} victorias no alcanzan. Forma: ${formStr || '—'}.` },
      ] : [
        { title: `🆘 ${relegTeam.name}: el descenso acecha`, desc: `A ${jLeft} jornadas, con ${relegTeam.pts} pts... Forma: ${formStr || '—'}. Las matemáticas son crueles.` },
      ];
      addNews({ ...pick(opts), team: relegTeam, type: 'relegation' });
    }
  }

  // === ASCENSO ===
  if (sorted2.length > 0 && matchday > 1) {
    const promoTeam = pick(sorted2.slice(0, Math.min(3, sorted2.length)).filter(t => !usedIds.has(t.id)));
    if (promoTeam) {
      const opts = phase === 'early' ? [
        { title: `⬆️ ${promoTeam.name} empieza bien en 2ª`, desc: `${promoTeam.pts} pts en las primeras jornadas. Si mantienen el nivel, el ascenso es real.` },
      ] : phase === 'mid' ? [
        { title: `⬆️ ${promoTeam.name} fuerte al ecuador en segunda`, desc: `${promoTeam.pts} pts a medio campeonato. La afición empieza a soñar con Primera.` },
      ] : phase === 'late' ? [
        { title: `🚀 ${promoTeam.name} aprieta por el ascenso`, desc: `${jLeft} jornadas y con ${promoTeam.pts} pts en zona de promoción. El sueño de Primera se siente cerca.` },
      ] : [
        { title: `🌟 ${promoTeam.name} a un paso de Primera`, desc: `Últimas fechas y en puestos de ascenso. ${promoTeam.pts} pts. La ciudad entera contiene la respiración.` },
      ];
      addNews({ ...pick(opts), team: promoTeam, type: 'promotion' });
    }
  }

  // === ATAQUE LETAL (ATT >= 5) ===
  const offensiveBeasts = teams.filter(t => t.att >= 5 && !usedIds.has(t.id));
  if (offensiveBeasts.length > 0) {
    const beast = pick(offensiveBeasts);
    const gpm = matchday > 0 ? ((beast.gf || 0) / matchday).toFixed(1) : '0';
    addNews({ ...pick([
      { title: `⚔️ Poder ofensivo del ${beast.name}: nivel máximo`, desc: `ATT 5 y ${beast.gf || 0} goles (${gpm}/partido). ${phase === 'final' ? 'A estas alturas, su artillería es letal.' : 'Generan peligro constante.'}` },
      { title: `💥 ${beast.name}: la delantera más temida`, desc: `${beast.gf || 0} goles en ${matchday} jornadas. Cuando el dado acompaña a un ATT de 5, el resultado es demoledor.` },
    ]), team: beast, type: 'stats' });
  }

  // === MURO DEFENSIVO (DEF >= 5) ===
  const walls = teams.filter(t => t.def >= 5 && !usedIds.has(t.id));
  if (walls.length > 0) {
    const wall = pick(walls);
    const gapm = matchday > 0 ? ((wall.ga || 0) / matchday).toFixed(1) : '0';
    addNews({ ...pick([
      { title: `🛡️ ${wall.name}: muro defensivo`, desc: `Solo ${wall.ga || 0} goles en contra (${gapm}/partido). DEF 5 que se nota. ${phase === 'late' || phase === 'final' ? 'En la recta final, esa solidez vale oro.' : ''}` },
      { title: `🧱 ${wall.name} no regala nada atrás`, desc: `${wall.ga || 0} goles recibidos. Los rivales se estrellan contra su línea de fondo.` },
    ]), team: wall, type: 'defense' });
  }

  // === MÁXIMO GOLEADOR ===
  const topScorer = [...teams].sort((a, b) => (b.gf || 0) - (a.gf || 0))[0];
  if (topScorer && (topScorer.gf || 0) > 3 && !usedIds.has(topScorer.id)) {
    addNews({ ...pick([
      { title: `⚽ ${topScorer.name} lidera con ${topScorer.gf} goles`, desc: `${phase === 'early' ? 'En apenas unas jornadas, ya son los máximos anotadores.' : phase === 'final' ? 'En la definición, cada gol de más puede valer un título.' : `Jornada ${matchday} y nadie ha metido más.`}` },
      { title: `🥅 ${topScorer.name} hace vibrar las redes`, desc: `${topScorer.gf} tantos. ${phase === 'late' ? 'Argumentos de sobra para pelear arriba.' : 'Vocación ofensiva.'}` },
    ]), team: topScorer, type: 'scorer' });
  }

  // === RIVALIDAD (2º vs 1º) ===
  if (sorted[1] && sorted[0] && sorted[0].pts - sorted[1].pts <= 3 && matchday > 2 && !usedIds.has(sorted[1].id)) {
    const ch = sorted[1];
    const diff = sorted[0].pts - ch.pts;
    const chStreak = getStreak(ch.id);
    const leaderStreak = getStreak(sorted[0].id);
    const momentumText = chStreak.type === 'W' && chStreak.count >= 2 ? ` Y el ${ch.name} viene en racha de ${chStreak.count} victorias...` : leaderStreak.type === 'L' ? ` Y el líder viene de perder...` : '';
    const opts = phase === 'early' ? [
      { title: `🔥 ${ch.name} pisa los talones al líder`, desc: `${diff === 0 ? 'Empatados en puntos.' : `Solo ${diff} punto(s).`} Liga apretada desde el arranque.${momentumText}` },
    ] : phase === 'mid' ? [
      { title: `⚡ ${ch.name} no se despega del ${sorted[0].name}`, desc: `${diff} punto(s) al ecuador. La segunda vuelta será guerra por el título.${momentumText}` },
      { title: `🥊 Duelo en la cima: ${ch.name} vs ${sorted[0].name}`, desc: `${ch.pts} vs ${sorted[0].pts} pts. La pelea se define en los detalles.${momentumText}` },
    ] : phase === 'late' ? [
      { title: `🌡️ La liga hierve: ${ch.name} acecha`, desc: `${jLeft} jornadas, ${diff} punto(s). Cada tropiezo cambia todo.${momentumText}` },
    ] : [
      { title: `🔥 ${ch.name} a ${diff} punto(s) del título`, desc: `${jLeft} jornadas. Diferencia mínima. Cualquier resultado da un vuelco.${momentumText}` },
    ];
    addNews({ ...pick(opts), team: ch, type: 'rivalry' });
  }

  // === CAMBIO DE LÍDER / PÉRDIDA DE LIDERAZGO ===
  if (history && history.length >= 2 && matchday >= 2 && compType === 'league') {
    // Reconstruir la tabla de la jornada anterior para detectar cambio de líder
    const prevDay = lastDay;
    if (prevDay?.results) {
      // Simulamos: si el líder actual perdió o empató en la última jornada, puede haber habido cambio
      const leaderStreak = getStreak(sorted[0].id);
      const leaderLastResult = prevDay.results.find((r: any) => r.hId === sorted[0].id || r.aId === sorted[0].id);

      if (leaderLastResult) {
        const wasHome = leaderLastResult.hId === sorted[0].id;
        const leaderGoals = wasHome ? leaderLastResult.sh : leaderLastResult.sa;
        const rivalGoals = wasHome ? leaderLastResult.sa : leaderLastResult.sh;
        const leaderWon = leaderGoals > rivalGoals;
        const leaderLost = leaderGoals < rivalGoals;
        const leaderDrew = leaderGoals === rivalGoals;

        // Si el segundo está a 0-2 pts y el líder NO ganó → posible cambio de líder dramático
        const gap = sorted[0].pts - (sorted[1]?.pts || 0);

        if (leaderLost && gap <= 3 && sorted[1] && !usedIds.has(sorted[1].id)) {
          const newChallenger = sorted[1];
          const spicyOpts = [
            { title: `💥 ¡${sorted[0].name} TROPIEZA! ¿Se les escapa la Liga?`, desc: `El líder perdió en la última jornada y ${newChallenger.name} se le planta a ${gap} punto(s). ${gap === 0 ? '¡EMPATE EN LA CIMA! Esto se pone al rojo vivo.' : `La ventaja se reduce. ${newChallenger.name} huele sangre.`} ${leaderStreak.type === 'L' && leaderStreak.count >= 2 ? `¡Y van ${leaderStreak.count} derrotas seguidas! La crisis es real.` : 'Un tropiezo que puede costar carísimo.'}` },
            { title: `😱 Terremoto en la tabla: ${sorted[0].name} pierde y el liderato tiembla`, desc: `Derrota que duele. ${newChallenger.name} está a solo ${gap} punto(s). ${phase === 'final' ? 'A estas alturas, perder no es un tropiezo: es un drama.' : phase === 'late' ? 'En la recta final, estos puntos no se recuperan fácil.' : 'Todavía hay margen, pero la presión aumenta.'}` },
            { title: `🔻 ${sorted[0].name} afloja y ${newChallenger.name} aprieta`, desc: `Los de arriba pierden y los de abajo sonríen. Solo ${gap} punto(s) separan al 1º del 2º. ${gap === 0 ? '¡Liga igualada al milímetro!' : 'La tabla se comprime y cualquiera puede ser líder la próxima jornada.'} Dicen que las ligas se ganan con regularidad... ${sorted[0].name} acaba de perder una dosis de eso.` },
          ];
          addNews({ ...pick(spicyOpts), team: sorted[0], type: 'rivalry' });
        } else if (leaderDrew && gap <= 2 && sorted[1] && !usedIds.has(sorted[1].id)) {
          addNews({ ...pick([
            { title: `🤨 ${sorted[0].name} empata y deja la puerta abierta`, desc: `El líder solo suma uno. ${sorted[1].name} está a ${gap} punto(s). Un empate que sabe a derrota cuando te persiguen de cerca. ${phase === 'late' || phase === 'final' ? 'En esta fase, cada punto que dejas es un regalo para tus rivales.' : ''}` },
            { title: `😤 Empate amargo del ${sorted[0].name}`, desc: `2 puntos que se escapan. Con ${sorted[1].name} a ${gap} punto(s), estos empates se pagan caros. ${sorted[0].name} necesita volver a ganar o su ventaja será solo un recuerdo.` },
          ]), team: sorted[0], type: 'rivalry' });
        }
      }
    }
  }

  // === MULTI-LÍDER: Varios equipos empatados en puntos arriba ===
  if (matchday >= 2 && sorted.length >= 3 && compType === 'league') {
    const topPts = sorted[0].pts;
    const tiedAtTop = sorted.filter(t => t.pts === topPts);
    if (tiedAtTop.length >= 3 && topPts > 0) {
      const names = tiedAtTop.slice(0, 4).map(t => t.name);
      const nameStr = names.length <= 3 ? names.join(', ') : names.slice(0, 3).join(', ') + ` y ${names.length - 3} más`;
      addNews({ ...pick([
        { title: `🏁 ¡${tiedAtTop.length} equipos empatados en la cima!`, desc: `${nameStr} — todos con ${topPts} puntos. Esto es una locura. La igualdad es máxima y la diferencia de goles decide quién manda. ¿Cuántas jornadas aguantará este empate masivo?` },
        { title: `⚡ Liga de locos: ${tiedAtTop.length} líderes con ${topPts} pts`, desc: `${nameStr}. Nadie consigue despegarse. ${phase === 'late' || phase === 'final' ? 'Y en plena recta final... esto es un infarto colectivo.' : 'La competición más igualada que se recuerda.'} ¿Quién romperá el empate?` },
        { title: `🎭 ¡Empate masivo arriba! ${tiedAtTop.length} equipos pelean por 1 trono`, desc: `${nameStr}. Todos con ${topPts} pts. La liga no quiere un favorito, quiere DRAMA. Y lo está consiguiendo.` },
      ]), team: tiedAtTop[0], type: 'leader' });
    } else if (tiedAtTop.length === 2 && topPts > 0 && !usedIds.has(tiedAtTop[1].id)) {
      const [a, b] = tiedAtTop;
      const dgA = (a.gf || 0) - (a.ga || 0);
      const dgB = (b.gf || 0) - (b.ga || 0);
      addNews({ ...pick([
        { title: `🤝 ${a.name} y ${b.name}: co-líderes con ${topPts} pts`, desc: `Empate perfecto en la cima. ${dgA > dgB ? `${a.name} manda por diferencia de goles (+${dgA} vs +${dgB}).` : dgB > dgA ? `${b.name} tiene mejor diferencia de goles (+${dgB} vs +${dgA}).` : '¡Hasta la diferencia de goles es igual!'} ${phase === 'final' ? 'En las últimas jornadas, esto es dinamita pura.' : 'La liga se decide en los detalles.'}` },
        { title: `👀 Dos gallos para un corral: ${a.name} y ${b.name}`, desc: `Ambos con ${topPts} puntos. ${phase === 'late' ? 'El que pestañee, pierde.' : 'La liga tiene dos dueños. Pero al final, solo puede quedar uno.'} ¿Quién aguantará la presión?` },
      ]), team: a, type: 'leader' });
    }
  }

  // === FRASES PICANTES / PROVOCADORAS (aleatoriamente) ===
  if (matchday >= 3 && Math.random() > 0.6) {
    // Equipo grande en posición baja
    const bigTeams = sorted.filter(t => (t.att >= 4 && t.opp >= 4) || t.att >= 5);
    const bigTeamLow = bigTeams.find(t => {
      const pos = sorted.indexOf(t) + 1;
      return pos > totalTeams * 0.5 && !usedIds.has(t.id);
    });

    // Equipo modesto arriba
    const modestTeamHigh = sorted.slice(0, Math.max(3, Math.floor(totalTeams * 0.2))).find(t =>
      (t.att <= 3 && t.def <= 3) && !usedIds.has(t.id)
    );

    if (bigTeamLow && modestTeamHigh) {
      addNews({ ...pick([
        { title: `🌶️ ${modestTeamHigh.name} por encima del ${bigTeamLow.name}... ¡Sí, en serio!`, desc: `El fútbol de dados no entiende de presupuestos. ${modestTeamHigh.name} (${sorted.indexOf(modestTeamHigh) + 1}º) está por delante de ${bigTeamLow.name} (${sorted.indexOf(bigTeamLow) + 1}º). Los millones no ruedan el dado. A veces la humildad gana a la soberbia.` },
        { title: `😏 ¿Dónde está el ${bigTeamLow.name}? Pregunta seria`, desc: `Con plantilla de ATT ${bigTeamLow.att} y OPP ${bigTeamLow.opp} están en el puesto ${sorted.indexOf(bigTeamLow) + 1}. Mientras tanto, el ${modestTeamHigh.name} con ATT ${modestTeamHigh.att} está ${sorted.indexOf(modestTeamHigh) + 1}º. El dado es democrático... o despiadado.` },
      ]), team: bigTeamLow, type: 'surprise' });
    } else if (bigTeamLow) {
      const pos = sorted.indexOf(bigTeamLow) + 1;
      addNews({ ...pick([
        { title: `💀 ${bigTeamLow.name} en el puesto ${pos}... ¿esto es una broma?`, desc: `ATT ${bigTeamLow.att}, OPP ${bigTeamLow.opp || '?'}, presupuesto de campeón... y en la mitad baja de la tabla. El banquillo tiembla, la afición protesta, y el dado se ríe. A veces el fútbol (de dados) no tiene piedad.` },
        { title: `🗣️ La afición del ${bigTeamLow.name} pide explicaciones`, desc: `Puesto ${pos}. Con ese plantel, estar ahí abajo es un escándalo. ¿Mala suerte con los dados o falta de algo más? El debate está servido.` },
      ]), team: bigTeamLow, type: 'crisis' });
    }
  }


  if (compType !== 'league' && matchday > 0) {
    const roundLabel = (ph?: string) => ph === 'groups' ? 'Fase de grupos'
      : ph === 'Octavos' ? 'Octavos de final'
      : ph === 'Cuartos' ? 'Cuartos de final'
      : ph === 'Semis' ? 'Semifinales'
      : ph === 'Final' ? 'La Gran Final'
      : 'la eliminatoria';
    const playedLabel = lastDayLabel; // ronda que se acaba de jugar
    const nextLabel = roundLabel(cupPhase); // ronda vigente ahora mismo

    // --- CRÓNICA DE LA RONDA QUE SE ACABA DE JUGAR ---
    const rows = (lastDay?.results || []).filter((r: any) => r.sh !== null && r.sh !== undefined && r.sa !== null && r.sa !== undefined);
    if (rows.length) {
      // Partido más goleador de la jornada
      const topGame = [...rows].sort((a: any, b: any) => ((b.sh + b.sa) - (a.sh + a.sa)))[0];
      const tgH = teamById(topGame.hId); const tgA = teamById(topGame.aId);
      if (tgH && tgA) {
        addNews({
          title: `🎯 ${playedLabel}: ${tgH.name} ${topGame.sh}-${topGame.sa} ${tgA.name}`,
          desc: `El partido de la jornada en la ${compName}. ${(topGame.sh + topGame.sa) >= 5 ? '¡Festival de goles y los dados ardiendo!' : 'Partido cerrado, resuelto por detalles mínimos.'} ${topGame.penH !== null && topGame.penH !== undefined ? `Se decidió en los penaltis (${topGame.penH}-${topGame.penA}): drama puro desde los once metros.` : ''}`,
          team: topGame.sh >= topGame.sa ? tgH : tgA, type: 'cupRound'
        });
      }

      // Tanda de penaltis / agonía
      const penGame = rows.find((r: any) => r.penH !== null && r.penH !== undefined && r.id !== topGame.id);
      if (penGame) {
        const pH = teamById(penGame.hId); const pA = teamById(penGame.aId);
        const penWinner = penGame.penH > penGame.penA ? pH : pA;
        const penLoser = penGame.penH > penGame.penA ? pA : pH;
        if (penWinner && penLoser && !usedIds.has(penWinner.id)) {
          addNews({
            title: `🥶 ${penWinner.name} sobrevive en los penaltis (${penGame.penH}-${penGame.penA})`,
            desc: `${playedLabel} de la ${compName}: ${penGame.sh}-${penGame.sa} en los 90 y todo a la lotería de los once metros. ${penLoser.name} se va a casa con la sensación de que estuvo ahí, rozándolo. Así es la copa: cruel y adictiva.`,
            team: penWinner, type: 'cupRound'
          });
        }
      }

      // Goleada / paliza de la ronda
      const thrash = [...rows].sort((a: any, b: any) => Math.abs(b.sh - b.sa) - Math.abs(a.sh - a.sa))[0];
      if (thrash && Math.abs(thrash.sh - thrash.sa) >= 3) {
        const wTeam = teamById(thrash.sh > thrash.sa ? thrash.hId : thrash.aId);
        const lTeam = teamById(thrash.sh > thrash.sa ? thrash.aId : thrash.hId);
        if (wTeam && lTeam && !usedIds.has(wTeam.id)) {
          addNews({
            title: `💣 Paliza en la ${compName}: ${wTeam.name} arrasa ${Math.max(thrash.sh, thrash.sa)}-${Math.min(thrash.sh, thrash.sa)} al ${lTeam.name}`,
            desc: `${playedLabel}. Exhibición total. ${lTeam.name} no encontró la manera de frenar la avalancha y ahora toca reconstruir la moral. ${wTeam.name} manda un mensaje al resto del torneo.`,
            team: wTeam, type: 'cupRound'
          });
        }
      }
    }

    // --- QUÉ SE JUEGA AHORA MISMO ---
    const rTeam = pick(sorted.filter(t => !usedIds.has(t.id))) || pick(sorted);
    if (cupPhase === 'Final') {
      addNews({ ...pick([
        { title: `🏆 ¡AHORA SÍ: LA GRAN FINAL DE LA ${compName.toUpperCase()}!`, desc: `Solo quedan dos. Un partido, noventa minutos y una vida entera de recuerdos en juego. Quien gane escribe su nombre en letras de oro; quien pierda cargará con el "casi" toda la temporada.` },
        { title: `👑 FINAL de la ${compName}: el partido que lo decide todo`, desc: `Todo el torneo cobra sentido aquí. Sin mañana, sin excusas, sin red de seguridad. La presión es MÁXIMA y los dados no tienen piedad.` },
      ]), team: rTeam, type: 'cupNext' });
    } else if (cupPhase === 'Semis') {
      addNews({ ...pick([
        { title: `⚡ SEMIFINALES en marcha: la ${compName} arde`, desc: `Cuatro equipos, dos billetes para la final. Aquí se forjan leyendas o se rompen sueños. El que tiemble, se queda fuera.` },
        { title: `🔥 La ${compName} entra en semis`, desc: `A un paso de la final. Cada error puede ser letal y cada acierto, eterno. Ya no hay margen para fallar.` },
      ]), team: rTeam, type: 'cupNext' });
    } else if (cupPhase === 'Cuartos') {
      addNews({ ...pick([
        { title: `🏟️ CUARTOS DE FINAL: la ${compName} se estrecha`, desc: `Ocho pretendientes, cuatro supervivientes. Los cuartos separan a los buenos de los grandes. ¿Mandarán los favoritos o habrá campanada?` },
        { title: `⚔️ Arranca lo bueno: cuartos de la ${compName}`, desc: `Desde aquí, cada partido es una final. Ganar o volver a casa. La copa no perdona.` },
      ]), team: rTeam, type: 'cupNext' });
    } else if (cupPhase === 'Octavos') {
      addNews({ ...pick([
        { title: `🎯 OCTAVOS DE FINAL de la ${compName}`, desc: `Terminaron los grupos y empieza la eliminación directa. Dieciséis equipos, ocho sobrevivirán. Aquí ya no hay segundas oportunidades.` },
        { title: `🚪 Se abren los octavos en la ${compName}`, desc: `El sorteo dejó cruces de infarto. Los grandes ya no pueden esconderse: un mal día y adiós al sueño.` },
      ]), team: rTeam, type: 'cupNext' });
    } else {
      addNews({ ...pick([
        { title: `🌍 ${compName}: la fase de grupos sigue su curso`, desc: `${playedLabel} disputada y la clasificación se mueve. Cada punto acerca o aleja de los octavos; nadie puede relajarse.` },
        { title: `📋 Grupos de la ${compName}: cuentas abiertas`, desc: `Tras ${playedLabel}, hay equipos que ya respiran y otros que empiezan a hacer cálculos desesperados.` },
      ]), team: rTeam, type: 'cupNext' });
    }

    // --- GRANDE EN PELIGRO (según la forma reciente real) ---
    const bigTeamsInCup = sorted.filter(t => !usedIds.has(t.id) && (t.att >= 4 || t.opp >= 4));
    const struggling = bigTeamsInCup.filter(t => {
      const st = getStreak(t.id);
      return st.type === 'L' || (st.type === 'D' && st.count >= 2);
    });
    if (struggling.length > 0) {
      const team = pick(struggling);
      const st = getStreak(team.id);
      addNews({
        title: `⚠️ ¿Campanada a la vista? ${team.name} tambalea en la ${compName}`,
        desc: `Viene de ${st.count} ${st.type === 'L' ? 'derrota(s)' : 'empate(s)'} y ahora le toca ${nextLabel.toLowerCase()}. En liga se remonta; en copa, cada cruce es una sentencia. Reacción o eliminación.`,
        team, type: 'crisis'
      });
    }
  }

  // === EQUIPO SORPRESA ===
  if (matchday > 3 && sorted.length > 6) {
    const midTable = sorted.slice(Math.floor(totalTeams * 0.3), Math.floor(totalTeams * 0.6)).filter(t => !usedIds.has(t.id) && (t.w || 0) >= 2);
    if (midTable.length > 0) {
      const surprise = pick(midTable);
      const sStreak = getStreak(surprise.id);
      const formStr = sStreak.results.slice(0, 4).split('').map(r => r === 'W' ? '✅' : r === 'D' ? '🟡' : '🔴').join('');
      addNews({ ...pick([
        { title: `👀 ${surprise.name}: la revelación`, desc: `${surprise.w || 0} victorias en ${matchday} jornadas. Forma: ${formStr || '—'}. ${phase === 'late' ? 'Ya no son sorpresa: son realidad.' : 'Trabajan en silencio pero hacen ruido.'}` },
        { title: `🐴 Ojo con ${surprise.name}`, desc: `${surprise.pts} pts. Forma reciente: ${formStr || '—'}. ${phase === 'final' ? 'A estas alturas, su presencia no es casualidad.' : 'Un proyecto que empieza a dar frutos.'}` },
      ]), team: surprise, type: 'surprise' });
    }
  }

  // === INVICTO ===
  if (matchday > 3) {
    const unbeaten = sorted.filter(t => (t.l || 0) === 0 && (t.p || 0) > 2 && !usedIds.has(t.id));
    if (unbeaten.length > 0) {
      const ub = pick(unbeaten);
      addNews({ ...pick([
        { title: `🛡️ ${ub.name} sigue invicto tras ${matchday} jornadas`, desc: `${ub.w || 0}V ${ub.d || 0}E sin derrotas. ${phase === 'final' ? '¿Terminarán invictos? Sería histórico.' : 'Racha que impone respeto.'}` },
        { title: `✨ ${matchday} fechas y ${ub.name} no cae`, desc: `${ub.pts} pts sin conocer la derrota. Los dados no los han traicionado ni una sola vez.` },
      ]), team: ub, type: 'leader' });
    }
  }

  // === PEOR DEFENSA ===
  if (matchday > 2) {
    const worstDef = [...teams].filter(t => !usedIds.has(t.id)).sort((a, b) => (b.ga || 0) - (a.ga || 0))[0];
    if (worstDef && (worstDef.ga || 0) > 5) {
      const gapm = ((worstDef.ga || 0) / matchday).toFixed(1);
      addNews({ ...pick([
        { title: `🚪 ${worstDef.name} sufre atrás: ${worstDef.ga} goles en contra`, desc: `${gapm} goles/partido. ${phase === 'late' ? 'En la recta final, esos goles cuestan caro.' : 'El arco sigue abierto.'}` },
        { title: `📉 Crisis defensiva en ${worstDef.name}`, desc: `${worstDef.ga} goles encajados. ${worstDef.def <= 2 ? 'Con DEF de ' + worstDef.def + ', el dado les condena atrás.' : 'El cuerpo técnico busca soluciones.'}` },
      ]), team: worstDef, type: 'crisis' });
    }
  }

  // === DATO RANDOM DE DADOS ===
  if (matchday >= 3 && Math.random() > 0.5) {
    const totalGoals = teams.reduce((sum, t) => sum + (t.gf || 0), 0);
    const avgGoals = (totalGoals / (matchday * (totalTeams / 2))).toFixed(1);
    const highScoringGames = history?.reduce((count, day) => {
      return count + (day.results?.filter((r: any) => ((r.sh || 0) + (r.sa || 0)) >= 5).length || 0);
    }, 0) || 0;
    addNews({ ...pick([
      { title: `🎲 Estadísticas del dado: ${avgGoals} goles/partido`, desc: `${totalGoals} goles en ${matchday} jornadas. ${parseFloat(avgGoals) > 2.5 ? 'Los dados han sido generosos esta temporada. Espectáculo asegurado.' : parseFloat(avgGoals) < 1.5 ? 'Temporada de dados conservadores. Pocos goles pero mucha intensidad.' : 'Promedio equilibrado. El dado reparte con justicia.'}` },
      { title: `📊 El dado ha hablado: ${highScoringGames} goleadas en ${matchday} jornadas`, desc: `${highScoringGames > 3 ? 'Partidos de 5+ goles que no se olvidan fácil.' : 'Pocos escándalos en el marcador.'} El promedio general es de ${avgGoals} goles por partido.` },
    ]), type: 'luck' });
  }

  // Derbys siempre van primero, luego el resto aleatorio
  // === ORDEN CRONOLÓGICO / RELEVANCIA ===
  // Primero lo que acaba de pasar en la jornada, después el contexto de la temporada.
  const PRIORITY: Record<string, number> = {
    leadChange: 0, leaderFall: 1, bigLoss: 2, cupRound: 3, derby: 4, cupNext: 5,
    momentum: 6, rivalry: 7, leader: 8, crisis: 9, relegation: 10, promotion: 11,
    surprise: 12, scorer: 13, stats: 14, defense: 15, luck: 16, generic: 17
  };
  const ordered = news
    .map((n, i) => ({ n, i, p: PRIORITY[n.type] ?? 18 }))
    .sort((a, b) => a.p - b.p || a.i - b.i)
    .map(x => x.n);
  return ordered.slice(0, 9);
};

const NewsIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'leader': return <Trophy size={18} className='text-yellow-400' />;
    case 'crisis': case 'relegation': return <AlertCircle size={18} className='text-red-400' />;
    case 'promotion': case 'rivalry': return <TrendingUp size={18} className='text-emerald-400' />;
    case 'stats': case 'scorer': case 'defense': return <Flame size={18} className='text-orange-400' />;
    case 'momentum': return <TrendingUp size={18} className='text-yellow-400' />;
    case 'luck': return <Dice6 size={18} className='text-purple-400' />;
    case 'derby': return <Swords size={18} className='text-red-500' />;
    case 'preview': return <Eye size={18} className='text-cyan-400' />;
    case 'generic': case 'surprise': return <Star size={18} className='text-blue-400' />;
    default: return <Newspaper size={18} className='text-slate-300' />;
  }
};


const PenaltyDots = ({ history }) => {
  const totalLen = history ? history.length : 0;
  const startIdx = totalLen % 5 === 0 && totalLen > 0 ? totalLen - 5 : totalLen - (totalLen % 5);
  const visibleHistory = history && totalLen > 0 ? history.slice(startIdx) : [];

  return (
    <div className="flex justify-center gap-[3px] mb-2 min-h-[14px]">
      {visibleHistory.map((h, i) => {
        const globalIdx = startIdx + i;
        const isNewest = globalIdx === totalLen - 1;
        return (
          <div
            key={globalIdx}
            style={isNewest ? { animation: 'penDotPop 0.35s cubic-bezier(0.34,1.56,0.64,1) both' } : {}}
            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${h ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.8)]' : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]'}`}
          >
            <span className="text-[7px] text-white font-black">{h ? '✓' : '✗'}</span>
          </div>
        );
      })}
    </div>
  );
};

// ==========================================
// 4. VISTAS SECUNDARIAS (MÓDULOS DE UI)
// ==========================================

const ArchiveView = ({ setView, archive, selectedArchiveEntry, setSelectedArchiveEntry }) => {
  const [palmaresModal, setPalmaresModal] = useState<null | { title: string; compId: string; div: number }>(null);
  return (
  <div className='flex-grow flex flex-col'>

    <header className='flex items-center gap-3 mb-8 px-4'>
      <button onClick={() => selectedArchiveEntry ? setSelectedArchiveEntry(null) : setView('hub')} className='p-3 bg-slate-900/30 backdrop-blur-md rounded-2xl text-slate-300 hover:text-white active:scale-95 transition-all border border-white/10'><ChevronLeft /></button>
      <h2 className='text-xl font-black uppercase italic text-yellow-500 drop-shadow-md'>Salón de la Fama</h2>
    </header>

    <div className='px-4 pb-8'>
      {!selectedArchiveEntry ? (
        <div className='space-y-4'>
          <p className="text-[10px] text-slate-300 font-bold uppercase italic tracking-widest text-center mb-4 drop-shadow-md">Máximos Ganadores</p>
          <div className='grid grid-cols-2 gap-2 mb-6'>

                        <button onClick={() => setPalmaresModal({ title: 'Palmarés Champions', compId: 'C1', div: 1 })} className='flex flex-col items-center gap-1.5 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-2 py-3 text-center active:scale-95 transition-all'>
              <Trophy size={18} className='text-amber-400' />
              <span className='text-[8px] font-black uppercase italic tracking-wider text-amber-200'>Champions</span>
            </button>
            <button onClick={() => setPalmaresModal({ title: 'Palmarés Copa del Mundo', compId: 'C2', div: 1 })} className='flex flex-col items-center gap-1.5 rounded-2xl border border-sky-400/30 bg-sky-500/10 px-2 py-3 text-center active:scale-95 transition-all'>
              <Globe size={18} className='text-sky-400' />
              <span className='text-[8px] font-black uppercase italic tracking-wider text-sky-200'>Copa del Mundo</span>
            </button>

          </div>
          <p className="text-[10px] text-slate-300 font-bold uppercase italic tracking-widest text-center mb-6 drop-shadow-md">Últimos 10 Registros</p>
          {archive.length === 0 ? (
            <div className='text-center py-20 bg-slate-900/30 backdrop-blur-md rounded-3xl border border-white/10 shadow-xl'>
              <History size={48} className='mx-auto mb-4 text-slate-400' />
              <p className='text-xs font-black uppercase italic text-slate-300'>No hay registros guardados</p>
            </div>
          ) : (
            archive.map((entry, idx) => (
              <button key={entry.id || idx} onClick={() => setSelectedArchiveEntry(entry)} className='w-full p-4 bg-slate-900/30 backdrop-blur-md rounded-3xl border border-white/10 flex items-center gap-4 hover:bg-slate-800/50 active:scale-95 transition-all text-left shadow-lg group'>
                <div className='w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-yellow-500 shrink-0 group-hover:scale-110 transition-transform'><Trophy size={24} /></div>
                <div className='flex-grow overflow-hidden'>
                  <h3 className='text-sm font-black uppercase italic truncate text-white'>{entry.name} {entry.div === 2 ? '(2ª Div)' : ''}</h3>
                  <p className='text-[10px] text-slate-300 font-bold'>{entry.date} • Campeón: {entry.winner?.name || 'Desconocido'}</p>
                </div>
                <ArrowRight size={16} className='text-slate-400 shrink-0 group-hover:text-yellow-500 transition-colors' />
              </button>
            ))
          )}
        </div>
      ) : (
        <div className='bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-yellow-500/40 p-6 relative overflow-hidden shadow-2xl'>
          <div className='absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none'></div>
          <div className="text-center relative z-10">
            <Trophy size={56} className='text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]' />
            <h3 className='text-2xl font-black italic uppercase mb-1 text-white'>{selectedArchiveEntry.name} {selectedArchiveEntry.div === 2 ? '(2ª Div)' : ''}</h3>
            <p className='text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-6'>{selectedArchiveEntry.date}</p>

            <div className='bg-black/30 rounded-3xl p-6 mb-6 border border-white/10 backdrop-blur-sm'>
              <h4 className='text-[10px] font-black uppercase text-yellow-500/80 mb-4 tracking-widest'>Campeón del Torneo</h4>
              <div className='flex flex-col items-center justify-center gap-3'>
                <Shield color1={selectedArchiveEntry.winner?.color1} color2={selectedArchiveEntry.winner?.color2} initial={selectedArchiveEntry.winner?.name} size='lg' isFlag={selectedArchiveEntry.winner?.isFlag} />
                <span className='text-xl font-black uppercase italic text-yellow-400 mt-2'>{selectedArchiveEntry.winner?.name}</span>
              </div>
            </div>

            {selectedArchiveEntry.type === 'league' && selectedArchiveEntry.teams && (
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-4 border border-white/5 text-left">
                <h4 className='text-[10px] font-black uppercase text-slate-300 mb-3 flex items-center gap-2'><BarChart3 size={14}/> Top 4 Clasificación</h4>
                <div className="space-y-2">
                  {[...selectedArchiveEntry.teams].sort((a,b)=>b.pts-a.pts || (b.gf-b.ga)-(a.gf-a.ga)).slice(0, 4).map((t, i) => (
                    <div key={i} className={`flex items-center justify-between text-[10px] p-2 rounded-xl ${i===0 ? 'bg-yellow-500/20 text-yellow-100 font-black' : 'bg-black/20 text-slate-200 font-bold'}`}>
                        <div className="flex items-center gap-2">
                            <span className="w-3 text-slate-400">{i+1}</span>
                            <Shield color1={t.color1} color2={t.color2} initial={t.name} size='xs' isFlag={t.isFlag}/>
                            <span className="uppercase italic">{t.name}</span>
                        </div>
                        <span className="text-emerald-400">{t.pts} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedArchiveEntry.type !== 'league' && selectedArchiveEntry.bracket?.Final && selectedArchiveEntry.bracket.Final[0] && (
               <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-4 border border-white/5">
                 <h4 className='text-[10px] font-black uppercase text-slate-300 mb-3 flex justify-center items-center gap-2'><Swords size={14}/> La Gran Final</h4>
                 {(() => {
                   const finalMatch = selectedArchiveEntry.bracket.Final[0];
                   const home = selectedArchiveEntry.teams?.find(t => t.id === finalMatch.hId);
                   const away = selectedArchiveEntry.teams?.find(t => t.id === finalMatch.aId);
                   return (
                     <div className="flex items-center justify-between bg-black/30 p-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 w-20">
                           <Shield color1={home?.color1} color2={home?.color2} initial={home?.name} size='xs' isFlag={home?.isFlag}/>
                           <span className="text-[9px] font-bold uppercase truncate">{home?.name}</span>
                        </div>
                        <div className="flex flex-col items-center">
                           <span className="bg-slate-900/50 px-3 py-1 rounded text-[11px] font-black tabular-nums">{finalMatch.sh} - {finalMatch.sa}</span>
                           {finalMatch.penH !== null && finalMatch.penH !== undefined && (
                             <span className="text-[8px] text-blue-300 font-bold mt-1">(pen {finalMatch.penH}-{finalMatch.penA})</span>
                           )}
                        </div>
                        <div className="flex items-center gap-2 w-20 justify-end">
                           <span className="text-[9px] font-bold uppercase truncate text-right">{away?.name}</span>
                           <Shield color1={away?.color1} color2={away?.color2} initial={away?.name} size='xs' isFlag={away?.isFlag}/>
                        </div>
                     </div>
                   );
                 })()}
               </div>
            )}
          </div>
        </div>
            )}
    </div>

    {palmaresModal && (
      <div className='fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col p-6 overflow-y-auto custom-scrollbar' onClick={() => setPalmaresModal(null)}>
        <div className='flex items-center justify-between mb-6 mt-4' onClick={(e) => e.stopPropagation()}>
          <h2 className='text-xl font-black uppercase italic text-yellow-400 drop-shadow-md'>{palmaresModal.title}</h2>
          <button onClick={() => setPalmaresModal(null)} className='p-3 bg-slate-900/30 rounded-2xl text-slate-300 hover:text-white active:scale-95 transition-all border border-white/10'><X /></button>
        </div>
        <div className='max-w-md mx-auto w-full' onClick={(e) => e.stopPropagation()}>
          <TopWinnersTable compId={palmaresModal.compId} div={palmaresModal.div} emptyLabel='Todavía no hay campeones registrados.' />
        </div>
      </div>
    )}
  </div>
  );
};

const RulesView = ({ setView }) => (

  <div className='flex-grow px-4 pb-8 flex flex-col'>
    <header className='flex items-center gap-3 mb-8'>
      <button onClick={() => setView('hub')} className='p-3 bg-slate-900/30 backdrop-blur-md rounded-2xl text-slate-300 hover:text-white active:scale-95 transition-all border border-white/10'><ChevronLeft /></button>
      <h2 className='text-xl font-black uppercase italic text-blue-400 drop-shadow-md'>Reglas del Juego</h2>
    </header>
    <div className='space-y-4'>
      <div className='bg-slate-900/30 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg'>
        <h4 className='text-xs font-black uppercase italic text-emerald-400 mb-2'>1. Dos Divisiones</h4>
        <p className='text-[11px] font-bold text-slate-200 leading-relaxed'>Cada liga tiene 1ª y 2ª división. Al finalizar ambas, los 3 últimos de Primera descienden y los 3 primeros de Segunda ascienden, heredando e intercambiando estadísticas.</p>
      </div>
      <div className='bg-slate-900/30 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg'>
        <h4 className='text-xs font-black uppercase italic text-blue-400 mb-2'>2. Ataque y Defensa</h4>
        <p className='text-[11px] font-bold text-slate-200 leading-relaxed'>Para marcar gol, el atacante debe sacar un número menor o igual a su ATK. Si lo logra, el portero rival debe sacar un número <strong className='text-white'>menor o igual a su DEF</strong> para detenerlo.</p>
      </div>
      <div className='bg-slate-900/30 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg'>
        <h4 className='text-xs font-black uppercase italic text-purple-400 mb-2'>3. Guardado Automático</h4>
        <p className='text-[11px] font-bold text-slate-200 leading-relaxed'>Tu progreso de todas las ligas se guarda automáticamente. Cualquier edición que hagas en los equipos perdurará durante tus temporadas.</p>
      </div>
    </div>
  </div>
);

const HubView = ({ setView, setActiveCompId, setCompView, comps, seasonState, pendingLeagueIds, allLeaguesFinished, championsFinished, onSimulateLeague, onSimulateAll, onNewSeason, career, onOpenCareer }) => {
  const [showLeagues, setShowLeagues] = useState(false);
  const globalMatchday = seasonState?.globalMatchday || 1;
  const pending = pendingLeagueIds || [];
  const leagues = [
    { id: 'L1', color: 'blue' }, { id: 'L2', color: 'emerald' }, { id: 'L3', color: 'orange' }, 
    { id: 'L4', color: 'purple' }, { id: 'L5', color: 'red' }, { id: 'L6', color: 'indigo' }, { id: 'L7', color: 'pink' }
  ];

  return (
  <div className='flex-grow flex flex-col px-4 pb-8'>
    <header className='py-10 text-center'>
      <h1 className='text-5xl font-black uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-green-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]'>Football Hub</h1>
      <p className='text-[11px] text-slate-200 font-bold uppercase tracking-widest mt-3 drop-shadow-md'>Elite Dice Engine v6</p>
    </header>

    <section className='mb-8 bg-slate-900/40 backdrop-blur-md rounded-[2rem] p-5 border border-emerald-500/20 shadow-[0_0_30px_rgba(52,211,153,0.12)]'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <p className='text-[9px] font-black uppercase tracking-widest text-emerald-400'>🌎 Temporada {seasonState?.season || 1}</p>
          <h2 className='text-2xl font-black uppercase italic text-white tracking-tight drop-shadow-md'>Jornada Global {globalMatchday}</h2>
          <p className='text-[9px] font-bold uppercase tracking-wider text-slate-300 mt-1'>
            {allLeaguesFinished
              ? (championsFinished ? '🏆 Champions resuelta — lista para nueva temporada' : '🏆 Ligas finalizadas — juega la Champions League')
              : pending.length === 0
                ? '✔️ Jornada resuelta en todas las ligas'
                : `⏳ ${pending.length} liga${pending.length > 1 ? 's' : ''} con partidos pendientes`}
          </p>
        </div>
        <div className='w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-[inset_0_0_15px_rgba(52,211,153,0.2)]'><Calendar size={26}/></div>
      </div>
      {pending.length > 0 && (
        <button onClick={onSimulateAll} className='mt-4 w-full bg-amber-500/90 text-slate-950 py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2'>
          <Dices size={15}/> ▶ Simular jornada global {globalMatchday}
        </button>
      )}
      {allLeaguesFinished && !championsFinished && (
        <button onClick={() => { setActiveCompId('C1'); setCompView('main'); setView('competition'); }} className='mt-4 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 border border-blue-400/40'>
          <Trophy size={16} className='text-yellow-300 animate-pulse' /> Jugar Champions League
        </button>
      )}
      {allLeaguesFinished && championsFinished && (
        <button onClick={onNewSeason} className='mt-4 w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2'>
          <RotateCcw size={15}/> Iniciar nueva temporada global
        </button>
      )}
    </section>

    <div className='space-y-8 flex-grow'>
      <button onClick={onOpenCareer} className='w-full p-5 bg-slate-900/30 backdrop-blur-md rounded-[2rem] border border-amber-500/30 flex items-center justify-between hover:bg-amber-900/20 hover:border-amber-400/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] active:scale-[0.98] transition-all duration-300 group'>
        <div className='flex items-center gap-4'>
          <div className='w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 shadow-[inset_0_0_15px_rgba(245,158,11,0.25)] group-hover:scale-110 transition-transform duration-300'>
            <Briefcase size={28} />
          </div>
          <div className='text-left'>
            <h3 className='text-sm font-black uppercase italic text-white tracking-wide'>Modo Carrera</h3>
            <p className='text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-1'>
              {career?.active ? `${career.manager} · Rep ${career.reputation}` : 'Empieza en la Miscelánea 2ª'}
            </p>
          </div>
        </div>
        <div className='w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-amber-300 group-hover:bg-amber-500/20 transition-colors'><ArrowRight size={20} /></div>
      </button>

      <div className='grid grid-cols-2 gap-4'>
        <button onClick={() => setView('archive')} className='p-5 bg-slate-900/30 backdrop-blur-md rounded-[2rem] border border-white/10 flex flex-col items-center gap-3 hover:bg-slate-800/40 hover:border-yellow-500/30 hover:shadow-[0_0_25px_rgba(234,179,8,0.25)] active:scale-[0.98] transition-all duration-300 group'>
          <div className='w-14 h-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 shadow-[inset_0_0_15px_rgba(234,179,8,0.2)] group-hover:scale-110 transition-transform duration-300'><History size={28} /></div>
          <div className='text-center'>
            <h3 className='text-[13px] font-black uppercase italic text-white group-hover:text-yellow-400 transition-colors'>Historial</h3>
            <p className='text-[9px] text-slate-300 font-bold mt-1 tracking-widest uppercase'>Salón de Fama</p>
          </div>
        </button>

        <button onClick={() => setView('rules')} className='p-5 bg-slate-900/30 backdrop-blur-md rounded-[2rem] border border-white/10 flex flex-col items-center gap-3 hover:bg-slate-800/40 hover:border-blue-500/30 hover:shadow-[0_0_25px_rgba(59,130,246,0.25)] active:scale-[0.98] transition-all duration-300 group'>
          <div className='w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-[inset_0_0_15px_rgba(59,130,246,0.2)] group-hover:scale-110 transition-transform duration-300'><Info size={28} /></div>
          <div className='text-center'>
            <h3 className='text-[13px] font-black uppercase italic text-white group-hover:text-blue-400 transition-colors'>Reglas</h3>
            <p className='text-[9px] text-slate-300 font-bold mt-1 tracking-widest uppercase'>Cómo jugar</p>
          </div>
        </button>
      </div>

      <section>
        <h3 className='text-xs font-black uppercase text-slate-200 mb-4 flex items-center gap-2 drop-shadow-md tracking-wider'><Trophy size={14} className="text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" /> Torneos Internacionales</h3>
        <div className='grid grid-cols-2 gap-4'>
          {['C1', 'C2'].map(id => (
            <button key={id} onClick={() => { setActiveCompId(id); setCompView('main'); setView('competition'); }} className='p-6 bg-slate-900/30 backdrop-blur-md rounded-[2rem] border border-white/10 flex flex-col items-center gap-4 hover:bg-slate-800/40 hover:border-white/20 hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all duration-300 group'>
              <div className={`w-14 h-14 rounded-full bg-slate-950/40 flex items-center justify-center text-white border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-300 ${id === 'C1' ? 'drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]' : 'drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]'}`}>
                {id === 'C1' ? <Trophy size={28} className="text-blue-400" /> : <Globe size={28} className="text-emerald-400" />}
              </div>
              <div className='text-center'>
                <h4 className='text-[11px] font-black uppercase italic text-white tracking-wide'>{comps[id]?.name}</h4>
                <span className='text-[8px] font-bold px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-sm text-slate-100 mt-2 inline-block uppercase tracking-wider'>{comps[id]?.phase === 'groups' ? 'Fase Grupos' : comps[id]?.phase}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <button onClick={() => setShowLeagues(!showLeagues)} className='w-full p-5 bg-slate-900/30 backdrop-blur-md rounded-[2rem] border border-white/10 flex items-center justify-between hover:bg-slate-800/50 hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(52,211,153,0.15)] active:scale-[0.98] transition-all duration-300 group'>
          <div className='flex items-center gap-4'>
            <div className='w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[inset_0_0_15px_rgba(52,211,153,0.2)] group-hover:scale-110 transition-transform duration-300'>
              <ShieldIcon size={28} />
            </div>
            <div className='text-left'>
              <h3 className='text-sm font-black uppercase italic text-white tracking-wide group-hover:text-emerald-50 transition-colors'>Ligas Nacionales</h3>
              <p className='text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-1'>1ª y 2ª División con Ascensos</p>
            </div>
          </div>
          <motion.div animate={{ rotate: showLeagues ? 90 : 0 }} transition={{ type: "spring", stiffness: 200 }} className='w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-slate-200 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors'>
            <ArrowRight size={20} />
          </motion.div>
        </button>

        <AnimatePresence>
          {showLeagues && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className='overflow-hidden'>
              <div className='grid grid-cols-1 gap-2 pt-4 px-2'>
                {leagues.map(({id}) => {
                  const comp = comps[id]; if (!comp) return null;
                  const isConf = comp.teams && comp.teams.length > 0;
                  const isPending = pending.includes(id);
                  const finished = leagueSeasonOver(comp);
                  return (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={id} className={'p-4 bg-slate-900/30 backdrop-blur-md rounded-[1.5rem] border flex items-center justify-between transition-all duration-200 group ' + (isPending ? 'border-amber-500/30' : 'border-white/5')}>
                      <button onClick={() => { setActiveCompId(id); setCompView('main'); setView('competition'); }} className='flex items-center gap-4 flex-grow text-left'>
                        <div className='w-10 h-10 rounded-xl bg-slate-950/40 flex items-center justify-center text-slate-200 border border-white/5 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all'><BarChart3 size={18} /></div>
                        <div className='text-left'>
                          <h4 className='text-xs font-black uppercase italic text-slate-100 group-hover:text-white transition-colors tracking-wide'>{comp.name}</h4>
                          <p className={'text-[9px] font-bold uppercase tracking-wider mt-0.5 ' + (finished ? 'text-emerald-400' : 'text-slate-400')}>{isConf ? leagueProgressLabel(comp, globalMatchday) : 'No Inicializada'}</p>
                          {isPending && <p className='text-[8px] font-black uppercase tracking-wider text-amber-400 mt-0.5'>Partidos pendientes</p>}
                        </div>
                      </button>
                      {isPending ? (
                        <button onClick={() => onSimulateLeague && onSimulateLeague(id)} className='shrink-0 bg-amber-500/90 text-slate-950 px-3 py-2 rounded-xl text-[8px] font-black uppercase italic tracking-widest active:scale-95 transition-all flex items-center gap-1'>
                          <Dices size={12}/> Simular
                        </button>
                      ) : (
                        <ArrowRight size={16} className='text-slate-400 group-hover:text-emerald-400 transition-colors' />
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
    <footer className='py-6 text-center opacity-40'><p className='text-[9px] font-black uppercase tracking-widest text-white drop-shadow-md'>Powered by Dice Engine v6.0</p></footer>
  </div>
)};

const ConfigPanel = ({ initialComp, compId, onSave, onCancel, onTotalReset }) => {
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(initialComp)));
  const [editDiv, setEditDiv] = useState(1);
  const [drawModal, setDrawModal] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const hasStarted = initialComp.type === 'league' 
    ? (initialComp.matchday > 0 || initialComp.matchday2 > 0 || initialComp.history?.length > 0)
    : (initialComp.matchday > 0 || initialComp.history?.length > 0);

  const currentTeams = editDiv === 2 ? draft.teams2 : draft.teams;
  const updateTeamAttr = (id, field, val) => {
    if (editDiv === 2) {
      setDraft(prev => ({ ...prev, teams2: prev.teams2.map(t => t.id === id ? { ...t, [field]: val } : t) }));
    } else {
      setDraft(prev => ({ ...prev, teams: prev.teams.map(t => t.id === id ? { ...t, [field]: val } : t) }));
    }
  };

  const handleDrawUI = (type) => {
    if (hasStarted) return;
    const isWC = compId === 'C2';
    // Construir pool usando estado guardado actual para incluir equipos ascendidos
    const compsState = JSON.parse(window.localStorage.getItem(`${APP_ID}_comps`));
    const pool = isWC ? [...PRESETS.WC] : buildCLPool(compsState || getDefaultComps());
    const initializedPool = pool.map((t, i) => ({ ...t, id: i + 1, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }));

    initializedPool.sort((a, b) => (b.att + b.opp + b.def) - (a.att + a.opp + a.def));
    const pots = [
      initializedPool.slice(0, 8), initializedPool.slice(8, 16),
      initializedPool.slice(16, 24), initializedPool.slice(24, 32)
    ];
    const drawData = drawKnockoutGroups(initializedPool, isWC, type === 'shuffle');
    setDrawModal({ step: 'pots', pots, groups: drawData.groups, drawData });
  };

  return (
    <div className='flex-grow px-4 pb-24 relative'>
      {drawModal && (
          <div className='fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col p-6 overflow-y-auto custom-scrollbar'>
              <h2 className='text-2xl font-black uppercase italic text-yellow-400 text-center mb-6 mt-4 drop-shadow-md'>
                  {drawModal.step === 'pots' ? 'Bombos Generados' : 'Sorteo Finalizado'}
              </h2>
              {drawModal.step === 'pots' ? (
                  <div className='space-y-4 mb-20'>
                       <p className='text-[10px] text-center text-slate-300 font-bold mb-4 uppercase'>Equipos ordenados por ranking de fuerza en 4 bombos.</p>
                       {drawModal.pots.map((pot, i) => (
                           <div key={i} className='bg-slate-900/50 p-4 rounded-2xl border border-white/10'>
                               <h3 className='text-sm font-black uppercase text-blue-400 mb-3 flex items-center gap-2'><ShieldIcon size={14}/> Bombo {i+1}</h3>
                               <div className='grid grid-cols-2 gap-2'>
                                   {pot.map(t => (
                                       <div key={t.id} className='flex items-center gap-2 text-[10px] bg-black/30 p-2 rounded-xl border border-white/5'>
                                          <Shield color1={t.color1} color2={t.color2} initial={t.name} size='xs' isFlag={t.isFlag} />
                                          <span className='font-bold uppercase truncate'>{t.name}</span>
                                       </div>
                                   ))}
                               </div>
                           </div>
                       ))}
                       <button onClick={() => setDrawModal({...drawModal, step: 'groups'})} className='w-full mt-6 bg-emerald-600 py-4 rounded-xl font-black uppercase italic text-white active:scale-95 shadow-lg shadow-emerald-500/20 transition-all'>Asignar a Grupos (A-H)</button>
                  </div>
              ) : (
                  <div className='space-y-4 mb-20'>
                       <p className='text-[10px] text-center text-slate-300 font-bold mb-4 uppercase'>Grupos formados respetando reglas de confederación.</p>
                       <div className='grid grid-cols-1 gap-4'>
                           {drawModal.groups.map((g, i) => (
                               <div key={i} className='bg-slate-900/50 p-4 rounded-2xl border border-white/10'>
                                   <h3 className='text-[11px] font-black uppercase text-emerald-400 mb-2 flex justify-between'>
                                      <span>{g.name}</span>
                                   </h3>
                                   <div className='space-y-1.5'>
                                       {g.teamIds.map(id => {
                                           const t = drawModal.drawData.teams.find(x => x.id === id);
                                           return (
                                               <div key={id} className='flex items-center justify-between text-[10px] bg-black/30 p-2 rounded-xl border border-white/5'>
                                                   <div className='flex items-center gap-2'>
                                                       <Shield color1={t.color1} color2={t.color2} initial={t.name} size='xs' isFlag={t.isFlag} />
                                                       <span className='font-bold uppercase'>{t.name}</span>
                                                   </div>
                                               </div>
                                           );
                                       })}
                                   </div>
                               </div>
                           ))}
                       </div>
                       <div className='flex gap-3 mt-6'>
                          <button onClick={() => setDrawModal(null)} className='flex-1 bg-slate-800 border border-white/10 py-4 rounded-xl font-black uppercase italic text-white active:scale-95 transition-all'>Cancelar</button>
                          <button onClick={() => { setDraft(prev => ({...prev, ...drawModal.drawData})); setDrawModal(null); }} className='flex-[2] bg-blue-600 py-4 rounded-xl font-black uppercase italic text-white active:scale-95 shadow-lg shadow-blue-500/20 transition-all'>Confirmar y Guardar</button>
                       </div>
                  </div>
              )}
          </div>
      )}

      <div className='flex items-center gap-3 mb-6'>
        <button onClick={onCancel} className='p-2 bg-slate-900/30 backdrop-blur-md rounded-xl active:scale-95 transition-all border border-white/10'><ChevronLeft /></button>
        <h2 className='text-xl font-black italic uppercase drop-shadow-md'>Ajustes</h2>
      </div>

      <div className='bg-slate-900/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg mb-6'>
        <h3 className='text-xs font-black text-red-400 uppercase italic mb-3 flex items-center gap-2'><AlertTriangle size={14}/> Zona de Peligro</h3>
        <button onClick={() => setShowResetConfirm(true)} className='w-full py-4 bg-gradient-to-r from-red-700/60 via-red-600/50 to-red-700/60 text-red-200 font-black uppercase tracking-widest text-[11px] rounded-2xl border-2 border-red-500/40 active:scale-95 transition-all shadow-[0_0_25px_rgba(239,68,68,0.2)] hover:shadow-[0_0_35px_rgba(239,68,68,0.35)] hover:border-red-400/60 flex items-center justify-center gap-2 italic'>
           <RotateCcw size={15} className='text-red-300'/> Reiniciar Temporada (Ambas Divisiones)
         </button>
      </div>

      <AnimatePresence>
        {showResetConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md'>
            <motion.div initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 30 }} className='bg-gradient-to-b from-slate-900 to-slate-950 w-full max-w-sm rounded-[2rem] border border-red-500/30 shadow-2xl overflow-hidden'>
              <div className='bg-gradient-to-r from-red-900/60 via-red-800/40 to-red-900/60 px-6 py-5 border-b border-red-500/20'>
                <div className='flex items-center justify-center gap-3'>
                  <div className='w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30'>
                    <AlertTriangle size={20} className='text-red-400' />
                  </div>
                  <h3 className='text-lg font-black uppercase italic text-red-300 tracking-tight'>Reiniciar Temporada</h3>
                </div>
              </div>
              <div className='px-6 py-5'>
                <p className='text-sm font-bold text-slate-200 text-center leading-relaxed'>
                  Esto borrará <span className='text-red-400'>todo el progreso</span> de esta competición y restaurará los equipos originales.
                </p>
                <p className='text-[10px] font-bold text-slate-500 text-center mt-2 uppercase tracking-wider'>Esta acción no se puede deshacer</p>
              </div>
              <div className='flex gap-3 px-6 pb-6'>
                <button onClick={() => setShowResetConfirm(false)} className='flex-1 bg-slate-800/80 border border-white/10 text-slate-200 py-3.5 rounded-2xl text-[11px] font-black uppercase italic tracking-widest active:scale-95 transition-all'>
                  Cancelar
                </button>
                <button onClick={() => { onTotalReset(compId); setShowResetConfirm(false); }} className='flex-1 bg-gradient-to-r from-red-700/80 to-red-600/80 border-2 border-red-400/40 text-white py-3.5 rounded-2xl text-[11px] font-black uppercase italic tracking-widest active:scale-95 transition-all shadow-[0_0_25px_rgba(239,68,68,0.35)] flex items-center justify-center gap-2'>
                  <RotateCcw size={14} className='text-red-200'/> Reiniciar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {draft.type === 'league' && (
        <div className='flex mb-4 bg-slate-900/50 p-1 rounded-2xl border border-white/10 backdrop-blur-sm'>
          <button onClick={() => setEditDiv(1)} className={`flex-1 py-2 text-[10px] font-black uppercase italic rounded-xl transition-all ${editDiv === 1 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>1ª División</button>
          <button onClick={() => setEditDiv(2)} className={`flex-1 py-2 text-[10px] font-black uppercase italic rounded-xl transition-all ${editDiv === 2 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>2ª División</button>
        </div>
      )}

      {draft.type !== 'league' && (
        <div className='grid grid-cols-2 gap-2 mb-6'>
          <button onClick={() => handleDrawUI('auto')} disabled={hasStarted} className={`p-3 border rounded-2xl text-[8px] font-black uppercase italic flex flex-col items-center justify-center gap-1 transition-all backdrop-blur-md ${hasStarted ? 'opacity-40 cursor-not-allowed bg-yellow-900/20 border-yellow-500/10 text-yellow-500/50' : 'bg-yellow-600/20 text-yellow-200 border-yellow-500/40 hover:bg-yellow-600/40 active:scale-95'}`}>
            <Wand2 size={16}/> Auto-Rellenar
          </button>
          <button onClick={() => handleDrawUI('shuffle')} disabled={hasStarted} className={`p-3 border rounded-2xl text-[8px] font-black uppercase italic flex flex-col items-center justify-center gap-1 transition-all backdrop-blur-md ${hasStarted ? 'opacity-40 cursor-not-allowed bg-emerald-900/20 border-emerald-500/10 text-emerald-500/50' : 'bg-emerald-600/20 text-emerald-200 border-emerald-500/40 hover:bg-emerald-600/40 active:scale-95'}`}>
            <Shuffle size={16}/> Sorteo Dinámico
          </button>
          {hasStarted && <p className='col-span-2 text-[8px] text-center text-red-400 font-bold uppercase italic mt-1 drop-shadow-md'>No puedes re-sortear torneos en curso.</p>}
        </div>
      )}

      <div className='grid gap-4'>
        {(!Array.isArray(currentTeams) || currentTeams.length === 0) && <div className='text-center py-10 bg-slate-900/30 backdrop-blur-md rounded-[2rem] border border-dashed border-white/20'><p className='text-[10px] font-bold text-slate-300 uppercase italic'>No hay equipos configurados.</p></div>}
        {Array.isArray(currentTeams) && currentTeams.map(t => (
          <div key={t.id} className='bg-slate-900/30 backdrop-blur-md p-5 rounded-[2rem] border border-white/10 shadow-lg space-y-4'>
            <div className='flex items-center gap-4'>
              <Shield color1={t?.color1} color2={t?.color2} initial={t?.name} size='lg' isFlag={t?.isFlag} />
              <div className='flex-grow'>
                <input className='bg-black/30 w-full rounded-xl p-2 text-sm font-black italic uppercase border border-white/10 focus:border-blue-500 focus:bg-slate-800/80 outline-none text-white transition-colors backdrop-blur-sm' value={t?.name} onChange={(e) => updateTeamAttr(t.id, 'name', e.target.value)} />
                <div className='grid grid-cols-3 gap-2 mt-3'>
                  <AttrStepper label="Atk (1-5)" val={t.att} min={1} max={5} onUpdate={(v) => updateTeamAttr(t.id, 'att', v)} />
                  <AttrStepper label="Opp (1-5)" val={t.opp} min={1} max={5} onUpdate={(v) => updateTeamAttr(t.id, 'opp', v)} />
                  <AttrStepper label="Def (1-4)" val={t.def} min={1} max={4} onUpdate={(v) => updateTeamAttr(t.id, 'def', v)} />
                </div>
                <div className='flex gap-2 mt-3 bg-black/30 p-1.5 rounded-xl border border-white/5 w-max backdrop-blur-sm'>
                  <input type='color' value={t.color1} onChange={(e) => updateTeamAttr(t.id, 'color1', e.target.value)} className='w-8 h-8 rounded-lg bg-transparent cursor-pointer border-none p-0' />
                  <input type='color' value={t.color2} onChange={(e) => updateTeamAttr(t.id, 'color2', e.target.value)} className='w-8 h-8 rounded-lg bg-transparent cursor-pointer border-none p-0' />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xs px-6 z-50'>
        <button onClick={() => onSave(draft)} className='w-full bg-blue-600/80 backdrop-blur-md text-white py-4 rounded-2xl font-black uppercase italic tracking-widest shadow-[0_10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center gap-2 active:scale-95 transition-all border border-blue-400'><Save size={18} /> Guardar Cambios</button>
      </div>
    </div>
  );
};

// ==========================================
// 5. APLICACIÓN PRINCIPAL Y LÓGICA DE COMPETICIÓN
// ==========================================

function DiceFootballApp() {
  const [view, setView] = useState('hub');
  const [activeCompId, setActiveCompId] = useState(null);
  const [compView, setCompView] = useState('main');
  const [viewDiv, setViewDiv] = useState(1); 
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [championModalTab, setChampionModalTab] = useState<'stats' | 'results' | 'promotions' | 'bracket'>('stats');
  const [championModalDiv, setChampionModalDiv] = useState(1);
  const [standingsView, setStandingsView] = useState<'current' | 'previous'>('current');

  const [eliminatedModal, setEliminatedModal] = useState<{ compId: string; phase: string } | null>(null);
  const [resetConfirmModal, setResetConfirmModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showChampionsHistory, setShowChampionsHistory] = useState(false);
  const [cupAutoSim, setCupAutoSim] = useState(false);


  useEffect(() => {
    if (view !== 'hub' || compView !== 'main') window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      if (compView !== 'main') { setCompView('main'); }
      else if (view !== 'hub') { setView('hub'); setActiveCompId(null); }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [view, compView]);

  const [archive, setArchive] = useState(() => {
    try { const saved = window.localStorage.getItem(`${APP_ID}_archive`); if (saved) return JSON.parse(saved); } catch (e) {} return [];
  });
  useEffect(() => { try { window.localStorage.setItem(`${APP_ID}_archive`, JSON.stringify(archive)); } catch(e){} }, [archive]);

  const [selectedArchiveEntry, setSelectedArchiveEntry] = useState(null);

  useEffect(() => {
    const handler = (e) => { if (e.target.closest('button')) playClick(); };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, []);

  const [comps, setComps] = useState(() => {
    const defaultComps = getDefaultComps();
    try {
      const saved = window.localStorage.getItem(`${APP_ID}_comps`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const merged = { ...defaultComps };
          Object.keys(parsed).forEach(key => { if (merged[key]) merged[key] = { ...merged[key], ...parsed[key] }; });
          return merged;
        }
      }
    } catch (e) {}
    return defaultComps;
  });

  useEffect(() => { try { window.localStorage.setItem(`${APP_ID}_comps`, JSON.stringify(comps)); } catch(e){} }, [comps]);

  // Recupera en el registro permanente cualquier edición que todavía exista
  // en el historial visual de una partida creada antes del palmarés acumulativo.
  useEffect(() => {
    const recoverableTitles = [];
    LEAGUE_IDS.forEach(id => {
      const comp = comps[id];
      if (!comp) return;
      [
        { div: 1, records: comp.championsHistory },
        { div: 2, records: comp.championsHistory2 }
      ].forEach(({ div, records }) => {
        (records || []).forEach(record => {
          if (!record?.champion) return;
          recoverableTitles.push({
            compId: id,
            compName: comp.name,
            type: 'league',
            div,
            winner: record.champion,
            season: record.season
          });
        });
      });
    });
    registerTitles(recoverableTitles);
    // La recuperación solo se ejecuta al cargar la partida.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeComp = comps[activeCompId];
  const updateActiveComp = (newData) => setComps(prev => ({ ...prev, [activeCompId]: { ...prev[activeCompId], ...newData } }));
  const updateCompById = (cId: string, newData: any) => setComps(prev => ({ ...prev, [cId]: { ...prev[cId], ...newData } }));

  // ===== TEMPORADA GLOBAL / JORNADA GLOBAL =====
  const [seasonState, setSeasonState] = useState(() => {
    try {
      const saved = window.localStorage.getItem(SEASON_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return { ...DEFAULT_SEASON_STATE, ...parsed };
      }
    } catch (e) {}
    return { ...DEFAULT_SEASON_STATE };
  });

  useEffect(() => { try { window.localStorage.setItem(SEASON_KEY, JSON.stringify(seasonState)); } catch(e){} }, [seasonState]);

  const globalMatchday = seasonState.globalMatchday;


  const pendingLeagueIds = useMemo(
    () => LEAGUE_IDS.filter(id => leaguePendingAt(comps[id], globalMatchday)),
    [comps, globalMatchday]
  );
  const allLeaguesFinished = useMemo(() => LEAGUE_IDS.every(id => leagueSeasonOver(comps[id])), [comps]);
  const clFinal = comps['C1']?.bracket?.Final?.[0] || comps['C1']?.bracket?.Final;
  const championsFinished = !!(clFinal && clFinal.sh !== null && clFinal.sh !== undefined);

  // Cierre de temporada global: guarda clasificaciones finales, actualiza
  // previousStandings y genera (congela) los 32 de la Champions.
  const finishGlobalSeason = () => {
    const seasonNow = seasonState.season || 1;
    // Palmarés acumulativo (infinito): todos los campeones se guardan en una
    // única escritura para que un cierre interrumpido no deje ligas sin registrar.
    const seasonTitles = [];
    LEAGUE_IDS.forEach(id => {
      const c = comps[id];
      if (!c) return;
      const r1 = buildSeasonRecord(c.teams, seasonNow);
      const r2 = buildSeasonRecord(c.teams2, seasonNow);
      if (r1) seasonTitles.push({ compId: id, compName: c.name, type: 'league', div: 1, winner: r1.champion, season: seasonNow });
      if (r2) seasonTitles.push({ compId: id, compName: c.name, type: 'league', div: 2, winner: r2.champion, season: seasonNow });
    });
    registerTitles(seasonTitles);
    setComps(prev => {
      const next = { ...prev };
      LEAGUE_IDS.forEach(id => {
        const c = next[id];
        if (!c) return;
        const withHistory = registerSeasonSummary(c, seasonState.season || 1);
        next[id] = {
          ...withHistory,
          previousStandings: buildStandingsSnapshot(c.teams) || c.previousStandings || null,
          previousStandings2: buildStandingsSnapshot(c.teams2) || c.previousStandings2 || null
        };
      });

      // ¿El club del modo carrera se clasificó? (1ª División, top CL_SPOTS)
      const careerQualifiedName = (() => {
        if (!career.active || !career.teamId || career.div !== 1) return null;
        const comp = next[career.compId];
        const table = [...(comp?.teams || [])].sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf);
        const pos = table.findIndex(t => t.id === career.teamId) + 1;
        return pos > 0 && pos <= CL_SPOTS ? table[pos - 1].name : null;
      })();

      // Champions ÚNICA con las clasificaciones finales reales (participantes congelados).
      // El club de la carrera entra en este mismo cuadro: no existe otra Champions.
      const cl = getAutoFillData('C1', next, careerQualifiedName ? [careerQualifiedName] : []);
      if (cl) {
        const mine = careerQualifiedName ? (cl.teams || []).find(t => t.name === careerQualifiedName) : null;
        next['C1'] = {
          ...next['C1'], ...cl,
          name: next['C1']?.name || 'Champions League',
          careerTeamName: careerQualifiedName || null,
          careerTeamId: mine?.id || null,
          userTeamId: mine?.id || cl.userTeamId
        };
      }
      return next;
    });
    setCareer(c => (c.active ? { ...c, clSeason: seasonNow } : c));
    setSeasonState(s => ({ ...s, phase: 'champions' }));
  };

  // Nueva temporada global (tras la Champions)
  const startNewGlobalSeason = () => {
    setComps(prev => {
      const next = { ...prev };
      LEAGUE_IDS.forEach(id => {
        const c = next[id];
        if (!c) return;
        const ns = computeLeagueNewSeason(c) || {};
        next[id] = {
          ...c, ...ns,
          matchday: 0, matchday2: 0, history: [], history2: [],
          showWinner: false, showWinner2: false
        };
      });
      const defaults = getDefaultComps();
      next['C1'] = { ...defaults['C1'] };
      return next;
    });
    setSeasonState(s => ({ season: (s.season || 1) + 1, globalMatchday: 1, phase: 'leagues' }));
    setCareer(c => (c.active ? {
      ...c,
      completedOfficeWeeks: [],
      trainedMatchday: -1,
      medicalImmunityWeeks: 0,
      activeInjury: null,
      lastSimulationFeedback: null,
      seasonLog: []
    } : c));
    setActiveCompId(null);
    setCompView('main');
    setView('hub');
  };

  // El reloj global avanza sólo cuando TODAS las ligas resolvieron su jornada
  useEffect(() => {
    if (seasonState.phase !== 'leagues') return;
    if (LEAGUE_IDS.some(id => leaguePendingAt(comps[id], globalMatchday))) return;
    if (LEAGUE_IDS.every(id => leagueSeasonOver(comps[id]))) { finishGlobalSeason(); return; }
    setSeasonState(s => ({ ...s, globalMatchday: (s.globalMatchday || 1) + 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comps, globalMatchday, seasonState.phase]);

  // Helper para asegurar persistencia manual
  const manualSave = () => {
    try { 
      window.localStorage.setItem(`${APP_ID}_comps`, JSON.stringify(comps)); 
      setShowSaveModal(true);
      setTimeout(() => setShowSaveModal(false), 2000);
    } catch(e) {}
  };

  const archiveCompetition = (compId, div, customWinner = null) => {
    const comp = comps[compId];
    if (!comp) return;
    const isDiv2 = div === 2;
    const t = isDiv2 ? comp.teams2 : comp.teams;

    let winner = customWinner;
    if (!winner) {
      if (comp.type === 'league') {
        winner = [...t].sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga))[0];
      } else {
        const final = comp.bracket?.Final?.[0] || comp.bracket?.Final;
        if (final && final.sh !== null) {
          if (final.sh > final.sa) winner = t.find(x => x.id === final.hId);
          else if (final.sa > final.sh) winner = t.find(x => x.id === final.aId);
          else winner = t.find(x => x.id === (final.penH > final.penA ? final.hId : final.aId));
        }
      }
    }

    const entry = { 
      id: Date.now(), compId, name: comp.name, date: new Date().toLocaleDateString(), div, winner, 
      teams: t, history: isDiv2 ? comp.history2 : comp.history, bracket: comp.bracket, groups: comp.groups, type: comp.type 
    };
    setArchive(prev => [entry, ...prev].slice(0, 10));
    if (winner) {
      registerTitle({
        compId, compName: comp.name, type: comp.type === 'league' ? 'league' : 'cup',
        div, winner, season: seasonState?.season || 1
      });
    }
  };

  const [matchState, setMatchState] = useState(null);
  const [rolling, setRolling] = useState(false);
  const rollIntervalRef = useRef(null);

  useEffect(() => () => rollIntervalRef.current && clearInterval(rollIntervalRef.current), []);

  const startMatch = (homeId, awayId, isDiv2Context) => {
    const sourceTeams = isDiv2Context ? activeComp.teams2 : activeComp.teams;
    let home = sourceTeams.find(t => t.id === homeId);
    let away = sourceTeams.find(t => t.id === awayId);
    if (!home || !away) return;

    if (career?.active && careerTeam) {
      const base = {
        att: Math.max(career.baseDist?.att || 1, careerTeam.att || 1),
        opp: Math.max(career.baseDist?.opp || 1, careerTeam.opp || 1),
        def: Math.max(career.baseDist?.def || 1, careerTeam.def || 1)
      };
      const injury = career.activeInjury && career.activeInjury.matchday === careerMd ? career.activeInjury : null;
      let dist = career.tactic ? { ...career.tactic } : { ...base };
      if (injury) {
        dist = {
          ...dist,
          [injury.attr]: Math.max(1, (dist[injury.attr] || base[injury.attr] || 1) - (injury.penalty || 1))
        };
      }
      if (home.id === career.teamId || home.name === careerTeam.name) {
        home = { ...home, att: dist.att, opp: dist.opp, def: dist.def };
      }
      if (away.id === career.teamId || away.name === careerTeam.name) {
        away = { ...away, att: dist.att, opp: dist.opp, def: dist.def };
      }
    }

    const isVuelta = activeCompId === 'C1' && activeComp.matchday % 2 !== 0 && activeComp.phase !== 'Final' && activeComp.phase !== 'groups';
    let aggregate = null;
    if (isVuelta && activeComp.bracket) {
      const matchArray = Array.isArray(activeComp.bracket[activeComp.phase]) ? activeComp.bracket[activeComp.phase] : [activeComp.bracket[activeComp.phase]];
      const match = matchArray.find(m => m && m.hId === awayId && m.aId === homeId);
      if (match) aggregate = { sh: match.sa, sa: match.sh };
    }

    setMatchState({
      home, away, scoreH: 0, scoreA: 0, oppH: home.opp, oppA: away.opp, turn: 'H', phase: 'att', isDiv2Context,
      logs: ['⚽ ¡Comienza el encuentro!', aggregate ? `📊 Global: ${aggregate.sh} - ${aggregate.sa}` : 'Al terreno de juego.'],
      lastDie: 1, finished: false, isKnockout: activeComp.type === 'knockout' || (activeComp.type === 'cup' && activeComp.phase !== 'groups'), penalties: null, aggregate
    });
    setCompView('playing');
  };

  const handleRoll = () => {
    if (rolling || matchState.finished) return;
    setRolling(true);
    if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
    rollIntervalRef.current = setInterval(() => setMatchState(prev => prev ? { ...prev, lastDie: Math.floor(Math.random() * 6) + 1 } : prev), 100);

    setTimeout(() => {
      if (rollIntervalRef.current) { clearInterval(rollIntervalRef.current); rollIntervalRef.current = null; }
      const die = Math.floor(Math.random() * 6) + 1;
      setMatchState(prev => {
        if (!prev) return prev;
        if (prev.phase === 'penalties') {
          const isHome = prev.penalties.turn === 'H';
          const attacker = isHome ? prev.home : prev.away;
          const defender = isHome ? prev.away : prev.home;
          let { scoreH, scoreA, shotsH, shotsA, phase: penPhase = 'att' } = prev.penalties;
          let historyH = [...(prev.penalties.historyH || [])]; let historyA = [...(prev.penalties.historyA || [])];
          let newLogs = [...prev.logs]; let nextTurn = prev.penalties.turn;

          if (penPhase === 'att') {
            if (die <= attacker.att) { newLogs.unshift('🎯 ' + attacker.name + ' saca un ' + die + '. ¡A portería!'); penPhase = 'gk'; } 
            else {
              newLogs.unshift('❌ ' + attacker.name + ' falló el penalti (' + die + ').');
              if (isHome) { historyH = [...historyH, false]; shotsH++; } else { historyA = [...historyA, false]; shotsA++; }
              nextTurn = isHome ? 'A' : 'H'; penPhase = 'att';
            }
          } else {
            if (die > defender.def) {
              newLogs.unshift('⚽ ¡GOL de penalti! ' + attacker.name + ' marcó.');
              if (isHome) { historyH = [...historyH, true]; scoreH++; } else { historyA = [...historyA, true]; scoreA++; }
            } else {
              newLogs.unshift('🧤 ¡PARADÓN! El portero detuvo el penalti.');
              if (isHome) historyH = [...historyH, false]; else historyA = [...historyA, false];
            }
            if (isHome) shotsH++; else shotsA++;
            nextTurn = isHome ? 'A' : 'H'; penPhase = 'att';
          }

          let finished = false;
          if (penPhase === 'att') {
            if (shotsH >= 5 && shotsA >= 5) { if (scoreH !== scoreA && shotsH === shotsA) finished = true; }
            else if (scoreH > scoreA + (5 - shotsA) || scoreA > scoreH + (5 - shotsH)) finished = true;
          }
          if (finished) {
            newLogs.unshift('🏆 Ganador tanda: ' + (scoreH > scoreA ? prev.home.name : prev.away.name));
            return { ...prev, lastDie: die, logs: newLogs, finished: true, penalties: { scoreH, scoreA, shotsH, shotsA, finished: true, historyH, historyA } };
          }
          return { ...prev, lastDie: die, logs: newLogs, penalties: { scoreH, scoreA, shotsH, shotsA, turn: nextTurn, phase: penPhase, historyH, historyA } };
        }

        const isHome = prev.turn === 'H';
        const attacker = isHome ? prev.home : prev.away; const defender = isHome ? prev.away : prev.home;
        let newLogs = [...prev.logs]; let { scoreH, scoreA, phase: newPhase } = prev;

        if (newPhase === 'att') {
          if (die <= attacker.att) { newLogs.unshift('🎯 ' + attacker.name + ' saca ' + die + '. ¡Va a portería!'); newPhase = 'gk'; } 
          else { newLogs.unshift('❌ ' + attacker.name + ' falla (Dado: ' + die + ').'); return advanceTurn({ ...prev, lastDie: die, logs: newLogs, phase: 'att' }); }
        } else {
          if (die > defender.def) { newLogs.unshift('⚽ ¡GOL de ' + attacker.name + '! (Dado: ' + die + ')'); isHome ? scoreH++ : scoreA++; } 
          else { newLogs.unshift('🧤 ¡PARADÓN! Evitó el gol (Dado: ' + die + ').'); }
          return advanceTurn({ ...prev, lastDie: die, logs: newLogs, scoreH, scoreA, phase: 'att' });
        }
        return { ...prev, lastDie: die, logs: newLogs, phase: newPhase };
      });
      setRolling(false);
    }, 800);
  };

  const advanceTurn = (state) => {
    let nextOppH = state.turn === 'H' ? state.oppH - 1 : state.oppH;
    let nextOppA = state.turn === 'A' ? state.oppA - 1 : state.oppA;
    let nextTurn = state.turn === 'H' ? 'A' : 'H';
    if (nextTurn === 'H' && nextOppH <= 0) nextTurn = 'A';
    if (nextTurn === 'A' && nextOppA <= 0) nextTurn = 'H';

    if (nextOppH <= 0 && nextOppA <= 0) {
      const isChampions = activeCompId === 'C1';
      const isIda = isChampions && activeComp.matchday % 2 === 0 && activeComp.phase !== 'Final' && activeComp.phase !== 'groups';
      const isVuelta = isChampions && activeComp.matchday % 2 !== 0 && activeComp.phase !== 'Final' && activeComp.phase !== 'groups';
      let needsPenalties = state.isKnockout && state.scoreH === state.scoreA && !isIda && !isVuelta;
      if (isVuelta && state.aggregate) if (state.aggregate.sh + state.scoreH === state.aggregate.sa + state.scoreA) needsPenalties = true;

      if (needsPenalties) return { ...state, oppH: 0, oppA: 0, phase: 'penalties', penalties: { scoreH: 0, scoreA: 0, turn: 'H', shotsH: 0, shotsA: 0, phase: 'att', finished: false, historyH: [], historyA: [] }, logs: ['⚖️ Empate. ¡Penaltis!', ...state.logs] };
      return { ...state, oppH: 0, oppA: 0, finished: true, logs: ['🏁 Final.', ...state.logs] };
    }
    return { ...state, oppH: nextOppH, oppA: nextOppA, turn: nextTurn, phase: 'att' };
  };

  const simulateDivisionMatchday = (teams: any[], matchday: number, history: any[]) => {
    const schedule = generateLeagueSchedule(teams);
    if (matchday >= schedule.length) return null;
    const currentRound = Array.isArray(schedule) ? schedule[matchday] : [];
    const results = currentRound.map((m: any) => {
      let h = teams.find((t: any) => t.id === m.homeId);
      let a = teams.find((t: any) => t.id === m.awayId);
      if (career?.active && careerTeam) {
        const base = {
          att: Math.max(career.baseDist?.att || 1, careerTeam.att || 1),
          opp: Math.max(career.baseDist?.opp || 1, careerTeam.opp || 1),
          def: Math.max(career.baseDist?.def || 1, careerTeam.def || 1)
        };
        const injury = career.activeInjury && career.activeInjury.matchday === matchday ? career.activeInjury : null;
        let dist = career.tactic ? { ...career.tactic } : { ...base };
        if (injury) {
          dist = {
            ...dist,
            [injury.attr]: Math.max(1, (dist[injury.attr] || base[injury.attr] || 1) - (injury.penalty || 1))
          };
        }
        if (h && (h.id === career.teamId || h.name === careerTeam.name)) {
          h = { ...h, att: dist.att, opp: dist.opp, def: dist.def };
        }
        if (a && (a.id === career.teamId || a.name === careerTeam.name)) {
          a = { ...a, att: dist.att, opp: dist.opp, def: dist.def };
        }
      }
      let sh = 0, sa = 0;
      for(let i=0; i<(h?.opp||0); i++) if(Math.floor(Math.random()*6)+1 <= (h?.att||0) && Math.floor(Math.random()*6)+1 > (a?.def||0)) sh++;
      for(let i=0; i<(a?.opp||0); i++) if(Math.floor(Math.random()*6)+1 <= (a?.att||0) && Math.floor(Math.random()*6)+1 > (h?.def||0)) sa++;
      return { hId: m.homeId, aId: m.awayId, sh, sa };
    });
    const updatedTeams = teams.map((t: any) => {
      const res = results.find((r: any) => r.hId === t.id || r.aId === t.id);
      if (!res) return t;
      const isHome = res.hId === t.id;
      const gf = isHome ? res.sh : res.sa; const ga = isHome ? res.sa : res.sh;
      const w = gf > ga ? 1 : 0; const d = gf === ga ? 1 : 0; const l = gf < ga ? 1 : 0;
      return { ...t, p: t.p + 1, w: t.w + w, d: t.d + d, l: t.l + l, gf: t.gf + gf, ga: t.ga + ga, pts: t.pts + (w * 3 + d) };
    });
    const isFinished = matchday >= schedule.length - 1;
    const nextMatchday = matchday + 1;
    const newHistory = [{ day: matchday + 1, results }, ...history];
    return { updatedTeams, nextMatchday, newHistory, isFinished };
  };

  // Sincroniza (con el motor de dados existente) todas las jornadas pendientes
  // de las ligas indicadas hasta ponerlas al día con la jornada global.
  // Se hace en UNA sola actualización de estado para que nunca se resuelva
  // dos veces la misma jornada, aunque se llame en cadena.
  const syncLeaguesToGlobal = (ids: string[]) => {
    setComps(prev => {
      const next = { ...prev };
      let changed = false;
      ids.forEach(compId => {
        const comp = prev[compId];
        if (!comp || comp.type !== 'league') return;
        let upd = { ...comp };
        let touched = false;
        const runDiv = (teamsKey, mdKey, histKey, winKey) => {
          let guard = 0;
          while (divPendingAt(upd[teamsKey], upd[mdKey], globalMatchday) && guard++ < 60) {
            const res = simulateDivisionMatchday(upd[teamsKey], upd[mdKey] || 0, upd[histKey] || []);
            if (!res) break;
            touched = true;
            upd = {
              ...upd,
              [teamsKey]: res.updatedTeams,
              [mdKey]: res.nextMatchday,
              [histKey]: res.newHistory,
              [winKey]: res.isFinished ? true : upd[winKey]
            };
          }
        };
        runDiv('teams', 'matchday', 'history', 'showWinner');
        runDiv('teams2', 'matchday2', 'history2', 'showWinner2');
        if (touched) {
          // Al terminar su calendario, la liga guarda una COPIA independiente
          // de su clasificación final.
          if (leagueSeasonOver(upd)) {
            upd.previousStandings = buildStandingsSnapshot(upd.teams) || upd.previousStandings || null;
            upd.previousStandings2 = buildStandingsSnapshot(upd.teams2) || upd.previousStandings2 || null;
          }
          next[compId] = upd;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  };

  const simulateLeagueToGlobal = (compId) => syncLeaguesToGlobal([compId]);

  // Botón "Simular jornada global": resuelve la jornada actual en TODAS las ligas.
  const simulateAllPendingLeagues = () => syncLeaguesToGlobal(LEAGUE_IDS);

  // Tras un partido manual: el resto del universo resuelve la misma jornada global.
  const simulateOtherLeaguesToGlobal = (exceptId) =>
    syncLeaguesToGlobal(LEAGUE_IDS.filter(id => id !== exceptId));

  // ==========================================
  // MODO CARRERA (GDD DiceLeague V8 + V11)
  // ==========================================
  const CAREER_KEY = `${APP_ID}_career`;
  const [career, setCareer] = useState(() => {
    try {
      const saved = window.localStorage.getItem(CAREER_KEY);
      if (saved) { const parsed = JSON.parse(saved); if (parsed && typeof parsed === 'object') return { ...DEFAULT_CAREER, ...parsed }; }
    } catch (e) {}
    return { ...DEFAULT_CAREER };
  });
  useEffect(() => { try { window.localStorage.setItem(CAREER_KEY, JSON.stringify(career)); } catch (e) {} }, [career]);
  const [careerReview, setCareerReview] = useState(null);
  const [simulationInjuryAlert, setSimulationInjuryAlert] = useState<{
    affectedAttr: 'att' | 'opp' | 'def';
    attrLabel: string;
    die: number;
    physioCost: number;
    categoryLabel: string;
  } | null>(null);

  const careerComp = comps[career.compId] || comps[CAREER_LEAGUE_ID];
  const careerTeamsKey = career.div === 2 ? 'teams2' : 'teams';
  const careerTeams = careerComp?.[careerTeamsKey] || [];
  const careerTeam = careerTeams.find(t => t.id === career.teamId) || null;
  const careerMdKey = career.div === 2 ? 'matchday2' : 'matchday';
  const careerHistKey = career.div === 2 ? 'history2' : 'history';
  const careerMd = careerComp?.[careerMdKey] || 0;
  const careerSchedule = useMemo(() => generateLeagueSchedule(careerTeams), [careerTeams]);
  const careerStandings = useMemo(
    () => [...careerTeams].sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf),
    [careerTeams]
  );
  const careerPosition = careerStandings.findIndex(t => t.id === career.teamId) + 1;
  const careerDivisionFinished = careerSchedule.length > 0 && careerMd >= careerSchedule.length;
  const careerFixture = !careerDivisionFinished
    ? (careerSchedule[careerMd] || []).find(m => m.homeId === career.teamId || m.awayId === career.teamId)
    : null;
  const careerIsHome = !!careerFixture && careerFixture.homeId === career.teamId;
  const careerRival = careerFixture
    ? careerTeams.find(t => t.id === (careerIsHome ? careerFixture.awayId : careerFixture.homeId))
    : null;
  const careerWorldPending = pendingLeagueIds.filter(id => id !== career.compId).length;
  // Candidatos para (re)empezar: los 5 clubes más humildes y, si te despidieron
  // del club de tu primera temporada y era de los más bajos, ese club también.
  const careerCandidates = useMemo(() => {
    const pool = comps[CAREER_LEAGUE_ID]?.teams2 || [];
    const list = worstTeams(pool, 5);
    const firstId = career.firstTeamId;
    if (firstId && career.firstTeamCompId === CAREER_LEAGUE_ID && !list.some(t => t.id === firstId)) {
      const first = pool.find(t => t.id === firstId);
      if (first && tierOf(first) <= 2) list.push(first);
    }
    return list;
  }, [comps, career.firstTeamId, career.firstTeamCompId]);
  const careerUi = { Shield, DieIcon, FormBadges };

  // RESTAURACIÓN Y PROTECCIÓN DE ESTADÍSTICAS DEL EQUIPO (Estadísticas originales + mejoras de P/E)
  useEffect(() => {
    if (!career.active || !career.teamId || !careerTeam) return;

    // Estadísticas base auténticas del club del usuario (originales + mejoras de PE aplicadas)
    const base = {
      att: Math.max(career.baseDist?.att || 1, careerTeam.att || 1),
      opp: Math.max(career.baseDist?.opp || 1, careerTeam.opp || 1),
      def: Math.max(career.baseDist?.def || 1, careerTeam.def || 1)
    };

    const hasValidInjury = career.activeInjury && career.activeInjury.matchday === careerMd;

    // Si las stats en comps difieren de base (mejoras de PE), sincronizar comps
    if (careerTeam.att !== base.att || careerTeam.opp !== base.opp || careerTeam.def !== base.def) {
      setComps(prev => {
        const comp = prev[career.compId];
        if (!comp) return prev;
        const key = career.div === 2 ? 'teams2' : 'teams';
        const teams = comp[key] || [];
        return {
          ...prev,
          [career.compId]: {
            ...comp,
            [key]: teams.map(t => t.id === career.teamId ? { ...t, att: base.att, opp: base.opp, def: base.def } : t)
          }
        };
      });
    }

    if (!career.baseDist || (career.activeInjury && !hasValidInjury) || career.baseDist.att !== base.att || career.baseDist.opp !== base.opp || career.baseDist.def !== base.def) {
      setCareer(c => {
        const validInjury = c.activeInjury && c.activeInjury.matchday === careerMd;
        return {
          ...c,
          baseDist: base,
          tactic: c.tactic || base,
          activeInjury: validInjury ? c.activeInjury : null
        };
      });
    }
  }, [career.active, career.teamId, career.compId, career.div, careerMd, careerTeam]);

  const openCareer = () => {
    if (career.active && careerTeam) setView('career');
    else setView('careerSelect');
  };

  const startCareer = (teamId, manager) => {
    const team = (comps[CAREER_LEAGUE_ID]?.teams2 || []).find(t => t.id === teamId);
    if (!team) return;

    // Si ya había un club previo con estadísticas modificadas, restaurar el club anterior
    if (career.teamId && career.originalTeamStats && career.originalTeamStats.teamId === career.teamId) {
      const prevCompId = career.compId || career.originalTeamStats.compId;
      const prevTeamsKey = (career.div === 2 || career.originalTeamStats.div === 2) ? 'teams2' : 'teams';
      setComps(prev => {
        const comp = prev[prevCompId];
        if (!comp) return prev;
        return {
          ...prev,
          [prevCompId]: {
            ...comp,
            [prevTeamsKey]: (comp[prevTeamsKey] || []).map(t =>
              t.id === career.teamId
                ? { ...t, att: career.originalTeamStats.att, opp: career.originalTeamStats.opp, def: career.originalTeamStats.def }
                : t
            )
          }
        };
      });
    }

    setCareer(c => ({
      ...DEFAULT_CAREER,
      active: true,
      manager,
      compId: CAREER_LEAGUE_ID,
      div: CAREER_DIV,
      teamId,
      tier: tierOf(team),
      pe: 0,
      // La reputación es tuya: si ya tenías carrera, no se pierde al recomenzar
      reputation: c.seasonHistory?.length ? clampRep(c.reputation) : 10,
      startedSeason: seasonState.season || 1,
      contractStart: seasonState.season || 1,
      contractSeasons: CONTRACT_SEASONS,
      baseDist: { att: team.att, opp: team.opp, def: team.def },
      tactic: { att: team.att, opp: team.opp, def: team.def },
      seasonHistory: c.seasonHistory || [],
      firstTeamId: c.firstTeamId || teamId,
      firstTeamCompId: c.firstTeamCompId || CAREER_LEAGUE_ID,
      firstTeamDiv: c.firstTeamDiv || CAREER_DIV,
      signedForSeason: seasonState.season || 1,
      lastProcessedSeason: c.lastProcessedSeason || 0,
      medicalImmunityWeeks: 0,
      trainedMatchday: -1,
      originalTeamStats: {
        teamId: team.id,
        compId: CAREER_LEAGUE_ID,
        div: CAREER_DIV,
        att: team.att,
        opp: team.opp,
        def: team.def
      }
    }));
    setView('career');
  };

  const setCareerTactic = (dist) => setCareer(c => ({ ...c, tactic: dist }));

  const renameCareerManager = (name) => {
    const clean = (name || '').trim().slice(0, 24);
    if (!clean) return;
    setCareer(c => ({ ...c, manager: clean }));
  };

  const spendCareerPE = (attr) => {
    if (!careerTeam) return;
    const caps = tierCaps(career.tier || 1);
    const val = careerTeam[attr] || 0;
    const cost = peCostFor(val);
    if (val >= caps[attr] || career.pe < cost) return;
    const compId = career.compId;
    const upgraded = { ...careerTeam, [attr]: val + 1 };
    setComps(prev => ({
      ...prev,
      [compId]: {
        ...prev[compId],
        [careerTeamsKey]: (prev[compId]?.[careerTeamsKey] || []).map(t =>
          t.id === career.teamId ? { ...t, [attr]: val + 1 } : t
        )
      }
    }));
    setCareer(c => {
      const nextBase = { ...(c.baseDist || { att: careerTeam.att, opp: careerTeam.opp, def: careerTeam.def }) };
      nextBase[attr] = (nextBase[attr] || 0) + 1;
      // Los PE sobrantes que ya no pueden invertirse en el club se descartan
      return { ...c, pe: capPE(c.pe - cost, upgraded, c.tier || 1), baseDist: nextBase, tactic: nextBase };
    });
  };

  const applyTrainingStats = (newStats, peSpent) => {
    if (!careerTeam) return;
    const compId = career.compId;
    const upgraded = { ...careerTeam, att: newStats.att, opp: newStats.opp, def: newStats.def };
    setComps(prev => ({
      ...prev,
      [compId]: {
        ...prev[compId],
        [careerTeamsKey]: (prev[compId]?.[careerTeamsKey] || []).map(t =>
          t.id === career.teamId ? { ...t, att: newStats.att, opp: newStats.opp, def: newStats.def } : t
        )
      }
    }));
    setCareer(c => ({
      ...c,
      pe: Math.max(0, c.pe - peSpent),
      baseDist: { att: newStats.att, opp: newStats.opp, def: newStats.def },
      tactic: { att: newStats.att, opp: newStats.opp, def: newStats.def }
    }));
  };

  const applyDrillResult = (result) => {
    if (!careerTeam) return;

    const drillFeedback = {
      simulated: false,
      die: result.die,
      peGained: result.peGained || 0,
      peCost: result.peCost || 0,
      physioPaid: !!result.physioPaid,
      injuryOccurred: !!result.injuryOccurred,
      immunityPrevented: !!result.immunityPrevented,
      statLost: result.statLost && result.affectedAttr ? (result.affectedAttr === 'att' ? 'Ataque' : result.affectedAttr === 'opp' ? 'Ocasiones' : 'Defensa') : undefined,
      message: result.message
    };

    // Caso 1: Fisioterapia de Élite (paga PE y cancela lesión, jugando al 100% + 3 semanas de inmunidad médica)
    if (result.physioPaid) {
      setCareer(c => {
        const base = c.baseDist || { att: careerTeam.att, opp: careerTeam.opp, def: careerTeam.def };
        return {
          ...c,
          pe: Math.max(0, (c.pe || 0) - (result.peCost || 0)),
          trainedMatchday: careerMd,
          activeInjury: null,
          medicalImmunityWeeks: 3,
          immunityActivatedMatchday: careerMd,
          baseDist: base,
          tactic: base,
          lastTrainingResult: drillFeedback
        };
      });
      return;
    }

    // Caso 2: Se aceptó la baja temporal por lesión (baja de -1 sólo durante esta jornada + 3 semanas de inmunidad)
    if (result.statLost && result.affectedAttr) {
      const attr = result.affectedAttr;
      const attrLabel = attr === 'att' ? 'Ataque' : attr === 'opp' ? 'Ocasiones' : 'Defensa';

      setCareer(c => {
        const base = c.baseDist || { att: careerTeam.att, opp: careerTeam.opp, def: careerTeam.def };
        return {
          ...c,
          trainedMatchday: careerMd,
          activeInjury: {
            attr,
            label: attrLabel,
            matchday: careerMd,
            penalty: 1
          },
          // Se activa el escudo de inmunidad médica por 3 jornadas completas
          medicalImmunityWeeks: 3,
          immunityActivatedMatchday: careerMd,
          tactic: c.tactic || base,
          lastTrainingResult: drillFeedback
        };
      });
      return;
    }

    // Caso 3: Ganancia de PE (Dado 1: +2 PE, Dado 2: +1 PE)
    if (result.peGained > 0) {
      setCareer(c => ({
        ...c,
        pe: (c.pe || 0) + result.peGained,
        trainedMatchday: careerMd,
        lastTrainingResult: drillFeedback
      }));
      return;
    }

    // Caso 4: Otros casos (ej: inmunidad médica activa previa que evitó la lesión, o resultado neutro)
    setCareer(c => ({
      ...c,
      trainedMatchday: careerMd,
      lastTrainingResult: drillFeedback
    }));
  };

  // Empieza el partido del técnico con su distribución táctica elegida
  const startCareerMatch = () => {
    if (!careerFixture || !careerTeam || !careerRival) return;
    const base = {
      att: Math.max(career.baseDist?.att || 1, careerTeam.att || 1),
      opp: Math.max(career.baseDist?.opp || 1, careerTeam.opp || 1),
      def: Math.max(career.baseDist?.def || 1, careerTeam.def || 1)
    };
    const injury = career.activeInjury && career.activeInjury.matchday === careerMd ? career.activeInjury : null;

    let dist = career.tactic ? { ...career.tactic } : { ...base };
    if (injury) {
      dist = {
        ...dist,
        [injury.attr]: Math.max(1, (dist[injury.attr] || base[injury.attr] || 1) - 1)
      };
    }

    const home = careerIsHome ? { ...careerTeam, att: dist.att, opp: dist.opp, def: dist.def } : careerRival;
    const away = careerIsHome ? careerRival : { ...careerTeam, att: dist.att, opp: dist.opp, def: dist.def };
    setMatchState({
      home, away, scoreH: 0, scoreA: 0, oppH: home.opp, oppA: away.opp, turn: 'H', phase: 'att',
      isDiv2Context: career.div === 2,
      logs: [
        '⚽ ¡Comienza el encuentro!',
        `Salida táctica: ${dist.att}-${dist.opp}-${dist.def}`,
        ...(injury ? [`⚠️ Baja temporal médica en ${injury.label}: -1 pt sólo para este partido (Alta tras finalizar el encuentro)`] : [])
      ],
      lastDie: 1, finished: false, isKnockout: false, penalties: null, aggregate: null,
      careerMatch: true, careerMatchday: careerMd + 1
    });
    setView('careerMatch');
  };

  // Resuelve la jornada con un marcador dado (jugado con dados o simulado)
  const applyCareerMatchday = (scoreH, scoreA, trainingFeedback = null, extraTrainingPe = 0, nextImmunityWeeks = null, injuryOccurredThisMatchday = false) => {
    if (!careerFixture || !careerTeam) return;
    const compId = career.compId;
    const myGf = careerIsHome ? scoreH : scoreA;
    const myGa = careerIsHome ? scoreA : scoreH;
    const result = myGf > myGa ? 'W' : myGf === myGa ? 'D' : 'L';

    // Posición antes del partido
    const currentComp = comps[compId];
    const currentTeams = currentComp ? (career.div === 2 ? currentComp.teams2 : currentComp.teams) || [] : [];
    const sortedBefore = [...currentTeams].sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));
    const posBeforeIdx = sortedBefore.findIndex(t => t.id === career.teamId);
    const posBefore = posBeforeIdx >= 0 ? posBeforeIdx + 1 : 1;

    let posAfter = posBefore;

    // Estadísticas base auténticas del club del usuario (originales + mejoras de PE)
    const cleanBase = {
      att: Math.max(career.baseDist?.att || 1, careerTeam.att || 1),
      opp: Math.max(career.baseDist?.opp || 1, careerTeam.opp || 1),
      def: Math.max(career.baseDist?.def || 1, careerTeam.def || 1)
    };

    setComps(prev => {
      const comp = prev[compId];
      if (!comp) return prev;
      const teams = comp[careerTeamsKey] || [];
      const round = careerSchedule[careerMd] || [];
      const results = round.map(m => {
        if (m.homeId === careerFixture.homeId && m.awayId === careerFixture.awayId) {
          return { hId: m.homeId, aId: m.awayId, sh: scoreH, sa: scoreA };
        }
        const h = teams.find(t => t.id === m.homeId);
        const a = teams.find(t => t.id === m.awayId);
        let sh = 0, sa = 0;
        for (let i = 0; i < (h?.opp || 0); i++) if (Math.floor(Math.random() * 6) + 1 <= (h?.att || 0) && Math.floor(Math.random() * 6) + 1 > (a?.def || 0)) sh++;
        for (let i = 0; i < (a?.opp || 0); i++) if (Math.floor(Math.random() * 6) + 1 <= (a?.att || 0) && Math.floor(Math.random() * 6) + 1 > (h?.def || 0)) sa++;
        return { hId: m.homeId, aId: m.awayId, sh, sa };
      });
      const updatedTeams = teams.map(t => {
        const res = results.find(r => r.hId === t.id || r.aId === t.id);
        if (!res) return t.id === career.teamId ? { ...t, ...cleanBase } : t;
        const isH = res.hId === t.id;
        const gf = isH ? res.sh : res.sa; const ga = isH ? res.sa : res.sh;
        const w = gf > ga ? 1 : 0; const d = gf === ga ? 1 : 0; const l = gf < ga ? 1 : 0;
        return {
          ...t,
          ...(t.id === career.teamId ? cleanBase : {}),
          p: t.p + 1,
          w: t.w + w,
          d: t.d + d,
          l: t.l + l,
          gf: t.gf + gf,
          ga: t.ga + ga,
          pts: t.pts + (w * 3 + d)
        };
      });

      const sortedAfter = [...updatedTeams].sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));
      const posAfterIdx = sortedAfter.findIndex(t => t.id === career.teamId);
      posAfter = posAfterIdx >= 0 ? posAfterIdx + 1 : posBefore;

      const finished = careerMd >= careerSchedule.length - 1;
      return {
        ...prev,
        [compId]: {
          ...comp,
          [careerTeamsKey]: updatedTeams,
          [careerMdKey]: careerMd + 1,
          [careerHistKey]: [{ day: careerMd + 1, results }, ...(comp[careerHistKey] || [])],
          ...(career.div === 2 ? { showWinner2: finished ? true : comp.showWinner2 } : { showWinner: finished ? true : comp.showWinner })
        }
      };
    });

    // El mundo sigue jugando: el resto de ligas se pone al día
    syncLeaguesToGlobal(LEAGUE_IDS.filter(id => id !== compId));
    syncLeaguesToGlobal([compId]);

    const ownStrength = cleanBase.att + cleanBase.opp + cleanBase.def;
    const rivalStrength = (careerRival?.att || 0) + (careerRival?.opp || 0) + (careerRival?.def || 0);
    // Plus de gesta: en tiers bajos, vencer o empatar a un equipo grande premia extra
    const gap = rivalStrength - ownStrength;
    const lowTier = (career.tier || 1) <= 2;
    const bigRival = gap >= 2;
    const bonusPE = lowTier && bigRival ? (result === 'W' ? 3 : result === 'D' ? 2 : 0) : 0;
    const bonusRep = lowTier && bigRival ? (result === 'W' ? 0.5 : result === 'D' ? 0.25 : 0) : 0;
    const rep = Math.round((repForMatch(result, ownStrength, rivalStrength, career.reputation || 10) + bonusRep) * 10) / 10;
    const matchPe = peForResult(result) + bonusPE;
    const totalPeGained = matchPe + (extraTrainingPe || 0);

    const effectiveTraining = trainingFeedback || (career.trainedMatchday === careerMd ? career.lastTrainingResult : null);

    const simFeedback = {
      matchday: careerMd + 1,
      homeName: careerIsHome ? careerTeam.name : (careerRival?.name || 'Rival'),
      awayName: careerIsHome ? (careerRival?.name || 'Rival') : careerTeam.name,
      scoreH,
      scoreA,
      myGf,
      myGa,
      result,
      posBefore,
      posAfter,
      repDelta: rep,
      peDelta: totalPeGained,
      isHome: careerIsHome,
      rivalName: careerRival?.name || '',
      trainingResult: effectiveTraining || undefined
    };

    setCareer(c => {
      const prevStats = c.stats || { matches: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0 };
      const newStats = {
        matches: (prevStats.matches || 0) + 1,
        wins: (prevStats.wins || 0) + (result === 'W' ? 1 : 0),
        draws: (prevStats.draws || 0) + (result === 'D' ? 1 : 0),
        losses: (prevStats.losses || 0) + (result === 'L' ? 1 : 0),
        gf: (prevStats.gf || 0) + myGf,
        ga: (prevStats.ga || 0) + myGa
      };

      const newRep = clampRep(c.reputation + rep);

      // Resolución de postulación activa (2 semanas a ciegas)
      let updatedActiveApp = c.activeApplication;
      let updatedAppHistory = c.applicationHistory || [];
      let appResolutionModal = null;
      let newOffer = null;

      if (updatedActiveApp && updatedActiveApp.status === 'review') {
        const remaining = (updatedActiveApp.weeksRemaining ?? 2) - 1;
        if (remaining <= 0) {
          // Evaluación determinista al cabo de las 2 semanas
          const expPos = expectedPosition(currentTeams, career.teamId);
          const currentPerf = readPerformance(posAfter, expPos);
          const hasRecentHistoryBonus = (c.trophies?.leagues || 0) > 0 || (c.trophies?.champions || 0) > 0 || (c.trophies?.promotions || 0) > 0;

          const evalRes = evaluateApplication({
            clubTier: updatedActiveApp.tier || 1,
            reputation: newRep,
            performanceScore: currentPerf?.score || 0,
            position: posAfter,
            expected: expPos,
            hasRecentHistoryBonus
          });

          if (evalRes.accepted) {
            newOffer = {
              id: `${seasonState.season || 1}-${updatedActiveApp.compId}-${updatedActiveApp.div}-${updatedActiveApp.teamId}`,
              season: seasonState.season || 1,
              compId: updatedActiveApp.compId,
              compName: updatedActiveApp.compName,
              div: updatedActiveApp.div,
              teamId: updatedActiveApp.teamId,
              teamName: updatedActiveApp.teamName,
              color1: updatedActiveApp.color1,
              color2: updatedActiveApp.color2,
              isFlag: updatedActiveApp.isFlag,
              tier: updatedActiveApp.tier,
              standingStatus: updatedActiveApp.standingStatus || 'Media Tabla',
              requiredObjective: updatedActiveApp.requiredObjective || 'Cumplir los objetivos de la directiva',
              profile: updatedActiveApp.tier >= 4 ? 'Gigante de Primera' : updatedActiveApp.tier === 3 ? 'Top 6 / Europa' : 'Proyecto Deportivo',
              seasons: CONTRACT_SEASONS,
              reason: 'Candidatura formal aceptada por la junta directiva tras 2 semanas de evaluación.',
              fromApplication: true,
              weeksRemaining: 2
            };
            updatedAppHistory = [
              {
                id: `app-res-${Date.now()}`,
                teamName: updatedActiveApp.teamName,
                compName: updatedActiveApp.compName,
                tier: updatedActiveApp.tier,
                matchday: careerMd + 1,
                accepted: true,
                message: evalRes.message,
                rejectionType: null
              },
              ...updatedAppHistory
            ].slice(0, 30);
            appResolutionModal = {
              accepted: true,
              teamName: updatedActiveApp.teamName,
              compName: updatedActiveApp.compName,
              tier: updatedActiveApp.tier,
              color1: updatedActiveApp.color1,
              color2: updatedActiveApp.color2,
              isFlag: updatedActiveApp.isFlag,
              message: evalRes.message,
              offer: newOffer
            };
            updatedActiveApp = null;
          } else {
            updatedAppHistory = [
              {
                id: `app-res-${Date.now()}`,
                teamName: updatedActiveApp.teamName,
                compName: updatedActiveApp.compName,
                tier: updatedActiveApp.tier,
                matchday: careerMd + 1,
                accepted: false,
                message: evalRes.message,
                rejectionType: evalRes.rejectionType
              },
              ...updatedAppHistory
            ].slice(0, 30);
            appResolutionModal = {
              accepted: false,
              teamName: updatedActiveApp.teamName,
              compName: updatedActiveApp.compName,
              tier: updatedActiveApp.tier,
              color1: updatedActiveApp.color1,
              color2: updatedActiveApp.color2,
              isFlag: updatedActiveApp.isFlag,
              message: evalRes.message,
              rejectionType: evalRes.rejectionType
            };
            updatedActiveApp = null;
          }
        } else {
          updatedActiveApp = {
            ...updatedActiveApp,
            weeksRemaining: remaining
          };
        }
      }

      // Caducidad de ofertas en el buzón: solo se quedan por 2 semanas y luego se limpia el buzón
      const prunedOffers = (c.offers || []).map(o => {
        const currentWeeks = typeof o.weeksRemaining === 'number' ? o.weeksRemaining : 2;
        return { ...o, weeksRemaining: currentWeeks - 1 };
      }).filter(o => o.weeksRemaining > 0);

      const finalOffers = newOffer
        ? [newOffer, ...prunedOffers.filter(o => o.id !== newOffer.id)]
        : prunedOffers;

      // Si en esta misma jornada se produjo lesión, se activan 3 semanas de inmunidad para las siguientes jornadas.
      // Si ya venía de antes, se consume 1 semana de protección.
      const injuryHappened = injuryOccurredThisMatchday || (c.activeInjury && c.activeInjury.matchday === careerMd);
      const finalImmunity = injuryHappened
        ? 3
        : nextImmunityWeeks !== null
        ? Math.max(0, nextImmunityWeeks - 1)
        : Math.max(0, (c.medicalImmunityWeeks || 0) - 1);

      return {
        ...c,
        pe: Math.max(0, (c.pe || 0) + totalPeGained),
        reputation: newRep,
        medicalImmunityWeeks: finalImmunity,
        trainedMatchday: careerMd,
        lastTrainingResult: effectiveTraining || c.lastTrainingResult,
        // ALTA MÉDICA AUTOMÁTICA: El equipo se recupera totalmente para el próximo partido
        activeInjury: null,
        baseDist: cleanBase,
        tactic: cleanBase,
        lastSimulationFeedback: simFeedback,
        stats: newStats,
        activeApplication: updatedActiveApp,
        offers: finalOffers,
        applicationHistory: updatedAppHistory,
        pendingAppResolutionModal: appResolutionModal || c.pendingAppResolutionModal,
        seasonLog: [
          { matchday: careerMd + 1, rival: careerRival?.name, gf: myGf, ga: myGa, result, rep, pe: totalPeGained, bonus: bonusPE > 0 },
          ...(c.seasonLog || [])
        ].slice(0, 60)
      };
    });

    setMatchState(null);
    setView('career');
  };

  // Resuelve la jornada tras jugar el partido con dados
  const finishCareerMatchday = () => {
    if (!matchState) return;
    if (matchState.careerChampionsMatch) {
      finishCareerChampionsMatch(matchState.scoreH, matchState.scoreA, matchState.penalties);
      return;
    }
    if (!careerFixture) return;
    applyCareerMatchday(matchState.scoreH, matchState.scoreA);
  };

  // Ejecuta el partido simulado con dados y aplica la jornada
  const executeCareerSimulatedMatch = (
    injuryAttr: 'att' | 'opp' | 'def' | null,
    trainingFeedback: any,
    extraPeGained: number,
    nextImmunityWeeks: number | null,
    injuryOccurredInSim: boolean
  ) => {
    if (!careerFixture || !careerTeam || !careerRival) return;
    const baseTeamStats = {
      att: Math.max(career.baseDist?.att || 1, careerTeam.att || 1),
      opp: Math.max(career.baseDist?.opp || 1, careerTeam.opp || 1),
      def: Math.max(career.baseDist?.def || 1, careerTeam.def || 1)
    };

    const tactic = career.tactic ? { ...career.tactic } : { ...baseTeamStats };
    let finalStats = { ...tactic };
    if (injuryAttr) {
      finalStats[injuryAttr] = Math.max(1, (finalStats[injuryAttr] || baseTeamStats[injuryAttr] || 1) - 1);
    }

    const mine = { ...careerTeam, att: finalStats.att, opp: finalStats.opp, def: finalStats.def };
    const home = careerIsHome ? mine : careerRival;
    const away = careerIsHome ? careerRival : mine;
    let sh = 0, sa = 0;
    for (let i = 0; i < (home.opp || 0); i++) if (Math.floor(Math.random() * 6) + 1 <= (home.att || 0) && Math.floor(Math.random() * 6) + 1 > (away.def || 0)) sh++;
    for (let i = 0; i < (away.opp || 0); i++) if (Math.floor(Math.random() * 6) + 1 <= (away.att || 0) && Math.floor(Math.random() * 6) + 1 > (home.def || 0)) sa++;

    applyCareerMatchday(sh, sa, trainingFeedback, extraPeGained, nextImmunityWeeks, injuryOccurredInSim);
  };

  // Manejador de la decisión del usuario en el Modal de Alerta Médica de Simulación
  const handleSimulationInjuryChoice = (option: 'accept_injury' | 'physio_elite') => {
    if (!simulationInjuryAlert || !careerFixture || !careerTeam || !careerRival) return;
    const { affectedAttr, attrLabel, physioCost } = simulationInjuryAlert;

    let trainingFeedback: any = null;
    let extraPeGained = 0;

    if (option === 'accept_injury') {
      trainingFeedback = {
        simulated: true,
        die: 6,
        peGained: 0,
        peCost: 0,
        physioPaid: false,
        injuryOccurred: true,
        immunityPrevented: false,
        statLost: attrLabel,
        newImmunityWeeks: 3,
        message: `Baja médica aceptada: -1 ${attrLabel} en este partido simulado. Alta médica automática tras el encuentro (+3 sem. Inmunidad Médica).`
      };
      setSimulationInjuryAlert(null);
      executeCareerSimulatedMatch(affectedAttr, trainingFeedback, 0, 3, true);
    } else {
      // Fisioterapia de Élite: Paga PE y anula la lesión
      extraPeGained = -physioCost;
      trainingFeedback = {
        simulated: true,
        die: 6,
        peGained: 0,
        peCost: physioCost,
        physioPaid: true,
        injuryOccurred: true,
        immunityPrevented: false,
        newImmunityWeeks: 3,
        message: `Fisioterapia de Élite aplicada (-${physioCost} PE). ¡Lesión cancelada, juegas al 100%! (+3 sem. Inmunidad Médica).`
      };
      setSimulationInjuryAlert(null);
      executeCareerSimulatedMatch(null, trainingFeedback, extraPeGained, 3, true);
    }
  };

  // Simula tu propio partido con la táctica elegida y resuelve la jornada
  const simulateCareerMatchday = () => {
    if (!careerFixture || !careerTeam || !careerRival) return;

    let trainingFeedback = null;
    let newImmunityWeeks = career.medicalImmunityWeeks || 0;
    let extraPeGained = 0;
    let injuryOccurredInSim = false;
    let injuryAttr: 'att' | 'opp' | 'def' | null = null;

    // Si aún no entrenó voluntariamente en esta jornada, se simula el entrenamiento con 1D6
    if (career.trainedMatchday !== careerMd) {
      const die = Math.floor(Math.random() * 6) + 1;
      if (die === 1) {
        extraPeGained = 2;
        trainingFeedback = {
          simulated: true,
          die: 1,
          peGained: 2,
          injuryOccurred: false,
          immunityPrevented: false,
          message: '¡Entrenamiento sobresaliente! +2 PE ganados.'
        };
      } else if (die === 2) {
        extraPeGained = 1;
        trainingFeedback = {
          simulated: true,
          die: 2,
          peGained: 1,
          injuryOccurred: false,
          immunityPrevented: false,
          message: '¡Buen entrenamiento! +1 PE ganado.'
        };
      } else if (die >= 3 && die <= 5) {
        trainingFeedback = {
          simulated: true,
          die,
          peGained: 0,
          injuryOccurred: false,
          immunityPrevented: false,
          message: 'Sesión neutra sin incidencias ni PE extras.'
        };
      } else if (die === 6) {
        const base = {
          att: Math.max(career.baseDist?.att || 1, careerTeam.att || 1),
          opp: Math.max(career.baseDist?.opp || 1, careerTeam.opp || 1),
          def: Math.max(career.baseDist?.def || 1, careerTeam.def || 1)
        };
        const tactic = career.tactic ? { ...career.tactic } : { ...base };
        const attrs: Array<'att' | 'opp' | 'def'> = ['att', 'opp', 'def'].filter(a => (tactic[a] || 1) > 1) as any;
        const affected: 'att' | 'opp' | 'def' = attrs.length > 0 ? attrs[Math.floor(Math.random() * attrs.length)] : 'att';
        const attrLabels = { att: 'Ataque (ATT)', opp: 'Ocasiones (OPP)', def: 'Defensa (DEF)' };

        if (newImmunityWeeks > 0) {
          trainingFeedback = {
            simulated: true,
            die: 6,
            peGained: 0,
            injuryOccurred: true,
            immunityPrevented: true,
            message: `🛡️ ¡Inmunidad Médica activa (${newImmunityWeeks} sem.) evitó la sobrecarga en ${attrLabels[affected]}!`
          };
        } else {
          // NO TIENE INMUNIDAD: ACTIVAR MODAL DE ALERTA MÉDICA Y DETENER SIMULACIÓN HASTA QUE EL USUARIO DECIDA
          const isDiv2 = career.div === 2;
          const isChampionsOrElite = (career.tier >= 5) || (career.inChampions);
          const physioCost = isDiv2 ? 12 : isChampionsOrElite ? 30 : 20;
          const categoryLabel = isDiv2 ? 'Segunda División' : isChampionsOrElite ? 'Champions League / Élite' : 'Primera División';

          setSimulationInjuryAlert({
            affectedAttr: affected,
            attrLabel: attrLabels[affected],
            die: 6,
            physioCost,
            categoryLabel
          });
          return;
        }
      }
    } else if (career.lastTrainingResult) {
      trainingFeedback = career.lastTrainingResult;
      // Si ya había entrenado voluntariamente en esta jornada y hubo lesión activa
      if (career.activeInjury && career.activeInjury.matchday === careerMd) {
        injuryAttr = career.activeInjury.attr;
        injuryOccurredInSim = true;
      }
    }

    executeCareerSimulatedMatch(injuryAttr, trainingFeedback, extraPeGained, newImmunityWeeks, injuryOccurredInSim);
  };

  /* ===================== CHAMPIONS EN MODO CARRERA =====================
   * No hay una Champions aparte: el club de la carrera juega LA MISMA Champions
   * League de la temporada global ('C1'). Aquí sólo se lee ese torneo y se
   * manda al técnico a jugarla con el motor de dados de siempre.
   */
  const clComp = comps['C1'];
  const careerClTeam = useMemo(() => {
    if (!careerTeam || !clComp?.teams?.length) return null;
    return clComp.teams.find(t => t.id === clComp.careerTeamId) ||
      clComp.teams.find(t => t.name === (clComp.careerTeamName || careerTeam.name)) || null;
  }, [clComp, careerTeam]);

  const careerClWinnerId = useMemo(() => {
    const final = clComp?.bracket?.Final?.[0] || clComp?.bracket?.Final;
    if (!final || final.sh === null || final.sh === undefined) return null;
    const tH = final.sh, tA = final.sa;
    if (tH > tA) return final.hId;
    if (tA > tH) return final.aId;
    return (final.penH || 0) > (final.penA || 0) ? final.hId : final.aId;
  }, [clComp]);

  const careerClAlive = useMemo(() => {
    if (!careerClTeam || !clComp) return false;
    if (clComp.phase === 'groups') return true;
    if (clComp.phase === 'Terminado') return careerClWinnerId === careerClTeam.id;
    const matches = Array.isArray(clComp.bracket?.[clComp.phase])
      ? clComp.bracket[clComp.phase]
      : [clComp.bracket?.[clComp.phase]].filter(Boolean);
    return matches.some(m => m.hId === careerClTeam.id || m.aId === careerClTeam.id);
  }, [clComp, careerClTeam, careerClWinnerId]);

  const careerClInfo = useMemo(() => {
    if (!careerClTeam) return null;
    const champion = careerClWinnerId === careerClTeam.id;
    const rival = (() => {
      if (!clComp || clComp.phase === 'groups' || clComp.phase === 'Terminado') return null;
      const matches = Array.isArray(clComp.bracket?.[clComp.phase])
        ? clComp.bracket[clComp.phase]
        : [clComp.bracket?.[clComp.phase]].filter(Boolean);
      const m = matches.find(x => x.hId === careerClTeam.id || x.aId === careerClTeam.id);
      if (!m) return null;
      const rivalId = m.hId === careerClTeam.id ? m.aId : m.hId;
      return clComp.teams.find(t => t.id === rivalId) || null;
    })();
    const group = clComp?.groups?.find(g => g.teamIds?.includes(careerClTeam.id));
    return {
      season: seasonState.season || 1,
      phase: clComp?.phase || 'groups',
      phaseLabel: clPhaseLabel(clComp?.phase),
      alive: careerClAlive,
      champion,
      eliminated: !careerClAlive && !champion,
      groupName: group?.name || null,
      rivalName: rival?.name || null,
      pts: careerClTeam.pts, p: careerClTeam.p, gf: careerClTeam.gf, ga: careerClTeam.ga,
      isGlobalPhase: seasonState.phase === 'champions'
    };
  }, [clComp, careerClTeam, careerClAlive, careerClWinnerId, seasonState.phase, seasonState.season]);

  // Simula hasta el final (100% de jornadas) todas las ligas europeas pendientes,
  // registra sus campeones, inicializa la Champions League con los clasificados reales
  // y abre la Champions League inmediatamente sin bloqueos.
  const finishAllLeaguesAndOpenChampions = () => {
    const seasonNow = seasonState.season || 1;
    setComps(prev => {
      const next = { ...prev };
      LEAGUE_IDS.forEach(compId => {
        const comp = prev[compId];
        if (!comp || comp.type !== 'league') return;
        let upd = { ...comp };
        const runDivToFinish = (teamsKey: string, mdKey: string, histKey: string, winKey: string) => {
          let guard = 0;
          const total = divTotalRounds(upd[teamsKey]);
          while ((upd[mdKey] || 0) < total && guard++ < 80) {
            const res = simulateDivisionMatchday(upd[teamsKey], upd[mdKey] || 0, upd[histKey] || []);
            if (!res) break;
            upd = {
              ...upd,
              [teamsKey]: res.updatedTeams,
              [mdKey]: res.nextMatchday,
              [histKey]: res.newHistory,
              [winKey]: res.isFinished ? true : upd[winKey]
            };
          }
        };
        runDivToFinish('teams', 'matchday', 'history', 'showWinner');
        runDivToFinish('teams2', 'matchday2', 'history2', 'showWinner2');

        if (leagueSeasonOver(upd)) {
          upd.previousStandings = buildStandingsSnapshot(upd.teams) || upd.previousStandings || null;
          upd.previousStandings2 = buildStandingsSnapshot(upd.teams2) || upd.previousStandings2 || null;
        }
        next[compId] = upd;
      });

      const seasonTitles = [];
      LEAGUE_IDS.forEach(id => {
        const c = next[id];
        if (!c) return;
        const r1 = buildSeasonRecord(c.teams, seasonNow);
        const r2 = buildSeasonRecord(c.teams2, seasonNow);
        if (r1) seasonTitles.push({ compId: id, compName: c.name, type: 'league', div: 1, winner: r1.champion, season: seasonNow });
        if (r2) seasonTitles.push({ compId: id, compName: c.name, type: 'league', div: 2, winner: r2.champion, season: seasonNow });
      });
      registerTitles(seasonTitles);

      LEAGUE_IDS.forEach(id => {
        const c = next[id];
        if (!c) return;
        const withHistory = registerSeasonSummary(c, seasonNow);
        next[id] = {
          ...withHistory,
          previousStandings: buildStandingsSnapshot(c.teams) || c.previousStandings || null,
          previousStandings2: buildStandingsSnapshot(c.teams2) || c.previousStandings2 || null
        };
      });

      // ¿El club del modo carrera se clasificó? (1ª División, top CL_SPOTS)
      const careerQualifiedName = (() => {
        if (!career.active || !career.teamId || career.div !== 1) return null;
        const comp = next[career.compId];
        const table = [...(comp?.teams || [])].sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf);
        const pos = table.findIndex(t => t.id === career.teamId) + 1;
        return pos > 0 && pos <= CL_SPOTS ? table[pos - 1].name : null;
      })();

      const cl = getAutoFillData('C1', next, careerQualifiedName ? [careerQualifiedName] : []);
      if (cl) {
        const mine = careerQualifiedName ? (cl.teams || []).find(t => t.name === careerQualifiedName) : null;
        next['C1'] = {
          ...next['C1'], ...cl,
          name: next['C1']?.name || 'Champions League',
          careerTeamName: careerQualifiedName || null,
          careerTeamId: mine?.id || null,
          userTeamId: mine?.id || cl.userTeamId
        };
      }
      return next;
    });

    setCareer(c => (c.active ? { ...c, clSeason: seasonNow } : c));
    setSeasonState(s => ({ ...s, phase: 'champions', globalMatchday: 38 }));
    setActiveCompId('C1');
    setCompView('main');
    setView('competition');
  };

  // Manda al técnico a la Champions global: mismo cuadro, mismos rivales, mismo motor
  const openCareerChampions = () => {
    if (comps['C1']?.teams?.length > 0 && seasonState.phase === 'champions') {
      setActiveCompId('C1');
      setCompView('main');
      setView('competition');
      return;
    }
    finishAllLeaguesAndOpenChampions();
  };

  // Inicia un partido de UEFA Champions League para el equipo del modo carrera con dados en directo
  const startCareerChampionsMatch = () => {
    let clComp = comps['C1'];
    if (!clComp?.teams?.length) {
      finishAllLeaguesAndOpenChampions();
      clComp = comps['C1'];
    }

    if (!clComp?.teams?.length || !careerTeam) return;

    const careerClTeam = clComp.teams.find(t => t.id === clComp.careerTeamId) ||
      clComp.teams.find(t => t.name === (clComp.careerTeamName || careerTeam.name));
    if (!careerClTeam) return;

    const phase = clComp.phase || 'groups';
    const matchday = clComp.matchday || 0;

    const baseTeamStats = {
      att: Math.max(career.baseDist?.att || 1, careerTeam.att || 1),
      opp: Math.max(career.baseDist?.opp || 1, careerTeam.opp || 1),
      def: Math.max(career.baseDist?.def || 1, careerTeam.def || 1)
    };
    const tactic = career.tactic ? { ...career.tactic } : { ...baseTeamStats };
    let myFinalStats = { ...tactic };
    if (career.activeInjury) {
      const attr = career.activeInjury.attr as 'att' | 'opp' | 'def';
      if (attr) myFinalStats[attr] = Math.max(1, (myFinalStats[attr] || 1) - 1);
    }

    if (phase === 'groups') {
      const userGroup = clComp.groups?.find((g: any) => g.teamIds?.includes(careerClTeam.id)) || clComp.groups?.[0];
      if (!userGroup) return;
      const groupTeams = clComp.teams.filter((t: any) => userGroup.teamIds?.includes(t.id));
      const rounds = generateLeagueSchedule(groupTeams, true);
      const currentRound = rounds[matchday % 6] || [];
      const match = currentRound.find((m: any) => m.homeId === careerClTeam.id || m.awayId === careerClTeam.id);
      if (!match) return;

      const rawHome = clComp.teams.find((t: any) => t.id === match.homeId);
      const rawAway = clComp.teams.find((t: any) => t.id === match.awayId);
      const isHome = match.homeId === careerClTeam.id;

      const myTeamResolved = {
        ...(isHome ? rawHome : rawAway),
        ...myFinalStats,
        color1: careerTeam.color1,
        color2: careerTeam.color2,
        isFlag: careerTeam.isFlag
      };

      const home = isHome ? myTeamResolved : rawHome;
      const away = isHome ? rawAway : myTeamResolved;

      setMatchState({
        home,
        away,
        scoreH: 0,
        scoreA: 0,
        oppH: home.opp,
        oppA: away.opp,
        turn: 'H',
        phase: 'att',
        lastDie: null,
        logs: [`⭐ UEFA Champions League: ${home.name} vs ${away.name}. ${userGroup.name} · Jornada ${(matchday % 6) + 1} de 6.`],
        penalties: null,
        finished: false,
        careerMatch: true,
        careerChampionsMatch: true,
        isKnockout: false,
        isChampions: true,
        championsPhase: 'groups'
      });
      setView('careerMatch');
    } else if (['Octavos', 'Cuartos', 'Semis', 'Final'].includes(phase)) {
      const bracketMatches = Array.isArray(clComp.bracket?.[phase])
        ? clComp.bracket[phase]
        : [clComp.bracket?.[phase]].filter(Boolean);

      const match = bracketMatches.find((m: any) => m && (m.hId === careerClTeam.id || m.aId === careerClTeam.id));
      if (!match) return;

      const isVuelta = matchday % 2 !== 0 && phase !== 'Final';
      const homeId = isVuelta ? match.aId : match.hId;
      const awayId = isVuelta ? match.hId : match.aId;
      const rawHome = clComp.teams.find((t: any) => t.id === homeId);
      const rawAway = clComp.teams.find((t: any) => t.id === awayId);
      const isHome = homeId === careerClTeam.id;

      const myTeamResolved = {
        ...(isHome ? rawHome : rawAway),
        ...myFinalStats,
        color1: careerTeam.color1,
        color2: careerTeam.color2,
        isFlag: careerTeam.isFlag
      };

      const home = isHome ? myTeamResolved : rawHome;
      const away = isHome ? rawAway : myTeamResolved;

      let aggregate = null;
      if (isVuelta && match.sh !== null && match.sa !== null) {
        aggregate = { sh: match.sa, sa: match.sh };
      }

      setMatchState({
        home,
        away,
        scoreH: 0,
        scoreA: 0,
        oppH: home.opp,
        oppA: away.opp,
        turn: 'H',
        phase: 'att',
        lastDie: null,
        logs: [`⭐ UEFA Champions League · ${clPhaseLabel(phase)}${isVuelta ? ' (Vuelta)' : phase === 'Final' ? ' (Gran Final)' : ' (Ida)'}: ${home.name} vs ${away.name}.`],
        penalties: null,
        finished: false,
        careerMatch: true,
        careerChampionsMatch: true,
        isKnockout: true,
        isVuelta,
        aggregate,
        isChampions: true,
        championsPhase: phase
      });
      setView('careerMatch');
    }
  };

  // Finaliza un partido de Champions League del modo carrera, aplicando PE, reputación, logs y sincronización global
  const finishCareerChampionsMatch = (
    scoreH: number,
    scoreA: number,
    penalties: any = null,
    simulatedTeams: { home: any; away: any } | null = null
  ) => {
    const clComp = comps['C1'];
    if (!clComp || !careerTeam) {
      setMatchState(null);
      setView('career');
      return;
    }

    const careerClTeam = clComp.teams.find(t => t.id === clComp.careerTeamId) ||
      clComp.teams.find(t => t.name === (clComp.careerTeamName || careerTeam.name));

    const activeHome = simulatedTeams?.home || matchState?.home;
    const activeAway = simulatedTeams?.away || matchState?.away;
    const isHome = activeHome?.id === careerClTeam?.id;
    const myGf = isHome ? scoreH : scoreA;
    const myGa = isHome ? scoreA : scoreH;
    const result: 'W' | 'D' | 'L' = myGf > myGa ? 'W' : myGf === myGa ? 'D' : 'L';
    const rivalName = isHome ? activeAway?.name : activeHome?.name;
    const currentPhase = clComp.phase || 'groups';

    // 1. Procesar la ronda en el torneo global C1
    processCupRound(
      {
        home: activeHome,
        away: activeAway,
        scoreH,
        scoreA,
        penalties
      },
      'C1'
    );

    // 2. Recompensas por partido europeo
    const peGained = result === 'W' ? (currentPhase === 'Final' ? 6 : 3) : result === 'D' ? 2 : 0;
    const repGained = result === 'W' ? (currentPhase === 'Final' ? 2.5 : 0.8) : result === 'D' ? 0.3 : -0.1;

    setCareer(c => {
      const cleanBase = {
        att: Math.max(c.baseDist?.att || 1, careerTeam.att || 1),
        opp: Math.max(c.baseDist?.opp || 1, careerTeam.opp || 1),
        def: Math.max(c.baseDist?.def || 1, careerTeam.def || 1)
      };
      const newRep = Math.max(0, Math.min(100, Math.round(((c.reputation || 10) + repGained) * 10) / 10));
      const newStats = {
        ...c.stats,
        played: (c.stats?.played || 0) + 1,
        wins: (c.stats?.wins || 0) + (result === 'W' ? 1 : 0),
        draws: (c.stats?.draws || 0) + (result === 'D' ? 1 : 0),
        losses: (c.stats?.losses || 0) + (result === 'L' ? 1 : 0),
        gf: (c.stats?.gf || 0) + myGf,
        ga: (c.stats?.ga || 0) + myGa
      };

      return {
        ...c,
        pe: Math.max(0, (c.pe || 0) + peGained),
        reputation: newRep,
        activeInjury: null,
        baseDist: cleanBase,
        tactic: cleanBase,
        stats: newStats,
        lastSimulationFeedback: {
          matchday: (clComp.matchday || 0) + 1,
          isChampions: true,
          rivalName: rivalName || 'Rival Europeo',
          myGf,
          myGa,
          result,
          peGained,
          repGained,
          headline: `⭐ UEFA Champions League · ${clPhaseLabel(currentPhase)}`,
          summary: result === 'W'
            ? `¡Victoria europea! ${myGf}-${myGa} contra ${rivalName}. Sumas +${peGained} PE y +${repGained} reputación.`
            : result === 'D'
            ? `Empate ${myGf}-${myGa} contra ${rivalName}. Sumas +${peGained} PE y +${repGained} reputación.`
            : `Derrota ${myGf}-${myGa} contra ${rivalName} en la Champions League.`
        },
        seasonLog: [
          {
            matchday: (clComp.matchday || 0) + 1,
            isChampions: true,
            phase: currentPhase,
            rival: rivalName,
            gf: myGf,
            ga: myGa,
            result,
            rep: repGained,
            pe: peGained
          },
          ...(c.seasonLog || [])
        ].slice(0, 60)
      };
    });

    setMatchState(null);
    setView('career');
  };

  // Simulación rápida de un partido de Champions League
  const simulateCareerChampionsMatch = () => {
    let clComp = comps['C1'];
    if (!clComp?.teams?.length) {
      finishAllLeaguesAndOpenChampions();
      clComp = comps['C1'];
    }

    if (!clComp?.teams?.length || !careerTeam) return;

    const careerClTeam = clComp.teams.find(t => t.id === clComp.careerTeamId) ||
      clComp.teams.find(t => t.name === (clComp.careerTeamName || careerTeam.name));
    if (!careerClTeam) return;

    const phase = clComp.phase || 'groups';
    const matchday = clComp.matchday || 0;

    const baseTeamStats = {
      att: Math.max(career.baseDist?.att || 1, careerTeam.att || 1),
      opp: Math.max(career.baseDist?.opp || 1, careerTeam.opp || 1),
      def: Math.max(career.baseDist?.def || 1, careerTeam.def || 1)
    };
    const tactic = career.tactic ? { ...career.tactic } : { ...baseTeamStats };
    let myFinalStats = { ...tactic };
    if (career.activeInjury) {
      const attr = career.activeInjury.attr as 'att' | 'opp' | 'def';
      if (attr) myFinalStats[attr] = Math.max(1, (myFinalStats[attr] || 1) - 1);
    }

    let home: any = null, away: any = null;

    if (phase === 'groups') {
      const userGroup = clComp.groups?.find((g: any) => g.teamIds?.includes(careerClTeam.id)) || clComp.groups?.[0];
      if (!userGroup) return;
      const groupTeams = clComp.teams.filter((t: any) => userGroup.teamIds?.includes(t.id));
      const rounds = generateLeagueSchedule(groupTeams, true);
      const currentRound = rounds[matchday % 6] || [];
      const match = currentRound.find((m: any) => m.homeId === careerClTeam.id || m.awayId === careerClTeam.id);
      if (!match) return;

      const rawHome = clComp.teams.find((t: any) => t.id === match.homeId);
      const rawAway = clComp.teams.find((t: any) => t.id === match.awayId);
      const isHome = match.homeId === careerClTeam.id;

      const myTeamResolved = {
        ...(isHome ? rawHome : rawAway),
        ...myFinalStats,
        color1: careerTeam.color1,
        color2: careerTeam.color2,
        isFlag: careerTeam.isFlag
      };

      home = isHome ? myTeamResolved : rawHome;
      away = isHome ? rawAway : myTeamResolved;
    } else if (['Octavos', 'Cuartos', 'Semis', 'Final'].includes(phase)) {
      const bracketMatches = Array.isArray(clComp.bracket?.[phase])
        ? clComp.bracket[phase]
        : [clComp.bracket?.[phase]].filter(Boolean);

      const match = bracketMatches.find((m: any) => m && (m.hId === careerClTeam.id || m.aId === careerClTeam.id));
      if (!match) return;

      const isVuelta = matchday % 2 !== 0 && phase !== 'Final';
      const homeId = isVuelta ? match.aId : match.hId;
      const awayId = isVuelta ? match.hId : match.aId;
      const rawHome = clComp.teams.find((t: any) => t.id === homeId);
      const rawAway = clComp.teams.find((t: any) => t.id === awayId);
      const isHome = homeId === careerClTeam.id;

      const myTeamResolved = {
        ...(isHome ? rawHome : rawAway),
        ...myFinalStats,
        color1: careerTeam.color1,
        color2: careerTeam.color2,
        isFlag: careerTeam.isFlag
      };

      home = isHome ? myTeamResolved : rawHome;
      away = isHome ? rawAway : myTeamResolved;
    }

    if (!home || !away) return;

    let simH = 0, simA = 0;
    for (let i = 0; i < (home.opp || 0); i++) if (Math.floor(Math.random() * 6) + 1 <= (home.att || 0) && Math.floor(Math.random() * 6) + 1 > (away.def || 0)) simH++;
    for (let i = 0; i < (away.opp || 0); i++) if (Math.floor(Math.random() * 6) + 1 <= (away.att || 0) && Math.floor(Math.random() * 6) + 1 > (home.def || 0)) simA++;

    let penalties: any = null;
    if (phase !== 'groups') {
      const isVuelta = matchday % 2 !== 0 && phase !== 'Final';
      const bracketMatches = Array.isArray(clComp.bracket?.[phase])
        ? clComp.bracket[phase]
        : [clComp.bracket?.[phase]].filter(Boolean);
      const match = bracketMatches.find((m: any) => m && (m.hId === home.id || m.aId === home.id || m.hId === away.id || m.aId === away.id));
      const leg1H = match?.sh || 0;
      const leg1A = match?.sa || 0;
      const isDraw = phase === 'Final' ? (simH === simA) : isVuelta ? ((leg1H + simA) === (leg1A + simH)) : false;

      if (isDraw) {
        let spH = 0, spA = 0, shH = 0, shA = 0;
        const simPen = (att: number, def: number) => (Math.floor(Math.random() * 6) + 1 <= att && Math.floor(Math.random() * 6) + 1 > def);
        for (let i = 0; i < 5; i++) {
          if (simPen(home.att, away.def)) spH++; shH++;
          if (spH > spA + (5 - shA) || spA > spH + (5 - shH)) break;
          if (simPen(away.att, home.def)) spA++; shA++;
          if (spH > spA + (5 - shA) || spA > spH + (5 - shH)) break;
        }
        while (spH === spA) {
          if (simPen(home.att, away.def)) spH++;
          if (simPen(away.att, home.def)) spA++;
        }
        penalties = { scoreH: spH, scoreA: spA };
      }
    }

    finishCareerChampionsMatch(simH, simA, penalties, { home, away });
  };

  // Simulación completa de una copa / torneo hasta su finalización en una sola ejecución pura
  const simulateEntireCupToFinish = (initialComp: any) => {
    if (!initialComp || initialComp.type === 'league') return initialComp;
    let comp = JSON.parse(JSON.stringify(initialComp));
    let guard = 0;

    while (guard++ < 40) {
      if (comp.phase === 'Terminado' || comp.showWinner) break;

      if (comp.phase === 'groups') {
        const isWorldCup = comp.id === 'C2';
        const maxMatchdays = isWorldCup ? 3 : 6;
        const results: any[] = [];

        (comp.groups || []).forEach((group: any) => {
          const groupTeams = (comp.teams || []).filter((t: any) => group.teamIds?.includes(t.id));
          const schedule = generateLeagueSchedule(groupTeams, !isWorldCup);
          const currentRound = schedule[(comp.matchday || 0) % maxMatchdays];
          if (currentRound) {
            currentRound.forEach((m: any) => {
              const h = (comp.teams || []).find((t: any) => t.id === m.homeId);
              const a = (comp.teams || []).find((t: any) => t.id === m.awayId);
              let sh = 0, sa = 0;
              for (let i = 0; i < (h?.opp || 0); i++) if (Math.floor(Math.random() * 6) + 1 <= (h?.att || 0) && Math.floor(Math.random() * 6) + 1 > (a?.def || 0)) sh++;
              for (let i = 0; i < (a?.opp || 0); i++) if (Math.floor(Math.random() * 6) + 1 <= (a?.att || 0) && Math.floor(Math.random() * 6) + 1 > (h?.def || 0)) sa++;
              results.push({ hId: m.homeId, aId: m.awayId, sh, sa, penH: null, penA: null });
            });
          }
        });

        const updatedTeams = (comp.teams || []).map((t: any) => {
          const res = results.find(r => r.hId === t.id || r.aId === t.id);
          if (!res) return t;
          const isHome = res.hId === t.id;
          const gf = isHome ? res.sh : res.sa;
          const ga = isHome ? res.sa : res.sh;
          const w = gf > ga ? 1 : 0;
          const d = gf === ga ? 1 : 0;
          const l = gf < ga ? 1 : 0;
          return {
            ...t,
            p: (t.p || 0) + 1,
            w: (t.w || 0) + w,
            d: (t.d || 0) + d,
            l: (t.l || 0) + l,
            gf: (t.gf || 0) + gf,
            ga: (t.ga || 0) + ga,
            pts: (t.pts || 0) + (w * 3 + d)
          };
        });

        const nextMatchday = (comp.matchday || 0) + 1;
        const isEndOfGroups = nextMatchday >= maxMatchdays;
        let newBracket = comp.bracket;
        if (isEndOfGroups) {
          newBracket = generateKnockoutBrackets({ ...comp, teams: updatedTeams });
        }

        comp = {
          ...comp,
          teams: updatedTeams,
          history: [{ day: 'Jornada ' + nextMatchday, results }, ...(comp.history || [])],
          matchday: nextMatchday,
          phase: isEndOfGroups ? (newBracket?.Octavos ? 'Octavos' : 'Cuartos') : 'groups',
          bracket: newBracket
        };
      } else {
        // Knockout
        const isChampions = comp.id === 'C1';
        const phase = comp.phase;
        const isVuelta = isChampions && (comp.matchday || 0) % 2 !== 0 && phase !== 'Final';
        const newBracket = { ...comp.bracket };
        const matchesToProcess = Array.isArray(newBracket[phase]) ? newBracket[phase] : [newBracket[phase]].filter(Boolean);
        const allResults: any[] = [];

        matchesToProcess.forEach((m: any) => {
          if (!m) return;
          const homeId = isVuelta ? m.aId : m.hId;
          const awayId = isVuelta ? m.hId : m.aId;
          const h = (comp.teams || []).find((t: any) => t.id === homeId);
          const a = (comp.teams || []).find((t: any) => t.id === awayId);
          let simH = 0, simA = 0;
          for (let i = 0; i < (h?.opp || 0); i++) if (Math.floor(Math.random() * 6) + 1 <= (h?.att || 0) && Math.floor(Math.random() * 6) + 1 > (a?.def || 0)) simH++;
          for (let i = 0; i < (a?.opp || 0); i++) if (Math.floor(Math.random() * 6) + 1 <= (a?.att || 0) && Math.floor(Math.random() * 6) + 1 > (h?.def || 0)) simA++;

          const matchSh = isVuelta ? simA : simH;
          const matchSa = isVuelta ? simH : simA;
          let penH: any = null, penA: any = null;

          const isDraw = (isChampions && isVuelta && phase !== 'Final')
            ? ((m.sh || 0) + matchSh === (m.sa || 0) + matchSa)
            : (matchSh === matchSa);

          if (isDraw && (!isChampions || isVuelta || phase === 'Final')) {
            let spH = 0, spA = 0, shH = 0, shA = 0;
            const sim = (att: number, def: number) => (Math.floor(Math.random() * 6) + 1 <= att && Math.floor(Math.random() * 6) + 1 > def);
            for (let i = 0; i < 5; i++) {
              if (sim(h?.att || 1, a?.def || 1)) spH++; shH++;
              if (spH > spA + (5 - shA) || spA > spH + (5 - shH)) break;
              if (sim(a?.att || 1, h?.def || 1)) spA++; shA++;
              if (spH > spA + (5 - shA) || spA > spH + (5 - shH)) break;
            }
            while (spH === spA) {
              if (sim(h?.att || 1, a?.def || 1)) spH++;
              if (sim(a?.att || 1, h?.def || 1)) spA++;
            }
            penH = isVuelta ? spA : spH;
            penA = isVuelta ? spH : spA;
          }

          if (isVuelta) {
            m.sh2 = matchSh;
            m.sa2 = matchSa;
          } else {
            m.sh = matchSh;
            m.sa = matchSa;
          }
          if (penH !== null) {
            m.penH = penH;
            m.penA = penA;
          }
          allResults.push(isVuelta
            ? { hId: m.aId, aId: m.hId, sh: matchSa, sa: matchSh, penH: penA, penA: penH }
            : { hId: m.hId, aId: m.aId, sh: matchSh, sa: matchSa, penH, penA }
          );
        });

        let nextPhase = phase;
        let showWinner = false;
        if (!isChampions || isVuelta || phase === 'Final') {
          const winners = matchesToProcess.map((m: any) => {
            const tH = isChampions && phase !== 'Final' ? ((m.sh || 0) + (m.sh2 || 0)) : (m.sh || 0);
            const tA = isChampions && phase !== 'Final' ? ((m.sa || 0) + (m.sa2 || 0)) : (m.sa || 0);
            if (tH > tA) return m.hId;
            if (tA > tH) return m.aId;
            return (m.penH || 0) > (m.penA || 0) ? m.hId : m.aId;
          });

          if (phase === 'Octavos') {
            nextPhase = 'Cuartos';
            newBracket.Cuartos = Array(4).fill(0).map((_, i) => ({ id: 'C' + (i + 1), hId: winners[i * 2], aId: winners[i * 2 + 1], sh: null, sa: null, penH: null, penA: null, sh2: null, sa2: null }));
          } else if (phase === 'Cuartos') {
            nextPhase = 'Semis';
            newBracket.Semis = Array(2).fill(0).map((_, i) => ({ id: 'S' + (i + 1), hId: winners[i * 2], aId: winners[i * 2 + 1], sh: null, sa: null, penH: null, penA: null, sh2: null, sa2: null }));
          } else if (phase === 'Semis') {
            nextPhase = 'Final';
            newBracket.Final = [{ id: 'F1', hId: winners[0], aId: winners[1], sh: null, sa: null, penH: null, penA: null, sh2: null, sa2: null }];
          } else {
            nextPhase = 'Terminado';
            showWinner = true;
          }
        }

        comp = {
          ...comp,
          history: [{ day: phase + (isChampions ? (isVuelta ? ' (Vuelta)' : ' (Ida)') : ''), results: allResults }, ...(comp.history || [])],
          matchday: (comp.matchday || 0) + 1,
          phase: nextPhase,
          bracket: newBracket,
          showWinner
        };
      }
    }

    return comp;
  };

  // Simulación de todo el torneo Champions League restante hasta coronar al campeón
  const simulateAllCareerChampions = () => {
    setComps(prev => {
      const c1 = prev['C1'];
      if (!c1 || c1.phase === 'Terminado' || c1.showWinner) return prev;
      const finishedC1 = simulateEntireCupToFinish(c1);
      if (finishedC1.showWinner) {
        archiveCompetition('C1', 1);
      }
      return {
        ...prev,
        C1: finishedC1
      };
    });
  };


  // Balance de temporada: objetivos, reputación, PE, contrato y mercado de entrenadores
  const buildCareerReview = () => {
    if (!careerTeam) return null;
    const season = seasonState.season || 1;
    const position = careerPosition || careerTeams.length;
    const expected = expectedPosition(careerTeams, career.teamId);
    const performance = readPerformance(position, expected);
    const objective = objectiveFor(career.tier || 1, position);

    // ¿Cumplió los objetivos de temporada? (los tres objetivos base del club)
    const objectiveItems = seasonObjectives({
      tier: career.tier || 1, div: career.div, position, expected,
      wins: careerTeam.w || 0, draws: careerTeam.d || 0, played: careerTeam.p || 0,
      totalRounds: careerSchedule.length, reputation: career.reputation,
      total: careerTeams.length,
      clQualified: !!careerClInfo, clPhase: careerClInfo?.phase,
      clChampion: !!careerClInfo?.champion, clEliminated: !!careerClInfo?.eliminated
    });
    const coreObjectives = objectiveItems.filter(o => !o.extra);
    const objectivesMet = coreObjectives.filter(o => o.done).length;

    // Recorrido europeo de ESTA temporada en la Champions global
    const clRep = clProgressRep({
      champion: !!careerClInfo?.champion,
      phaseReached: careerClInfo?.phase,
      played: !!careerClInfo
    });
    const clResult = careerClInfo
      ? (careerClInfo.champion
        ? '🏆 Campeón de la Champions'
        : careerClInfo.eliminated
          ? `Champions: eliminado en ${careerClInfo.phaseLabel}`
          : `Champions: ${careerClInfo.phaseLabel}`)
      : null;

    // Despido: más duro cuanto peor fue la temporada y la racha previa
    const chance = fireChance({
      objective, score: performance.score, objectivesMet,
      badStreak: career.badStreak || 0, tier: career.tier || 1
    });
    const fired = chance >= 1 || (chance > 0 && Math.random() < chance);

    let repDelta = Math.round((objective.rep + performance.score * 2 + clRep) * 10) / 10;
    
    // Reajuste de Final de Temporada (Especificación Técnica Élite):
    // Si el mánager tiene 90+ de reputación y no cumple el objetivo principal del club,
    // se aplica una deducción automática de -5 puntos de reputación por incumplimiento de expectativa de élite.
    if ((career.reputation || 0) >= 90 && (objectivesMet === 0 || position > expected)) {
      repDelta -= 5;
    }

    if (fired) repDelta -= 8; // el despido pesa en tu nombre
    const repAfter = clampRep(career.reputation + repDelta);
    const newTier = objective.promote ? Math.min(4, (career.tier || 1) + 1) : (career.tier || 1);
    const maxed = isSquadMaxed(careerTeam, career.tier || 1);
    // Contrato: máximo CONTRACT_SEASONS temporadas aunque todo vaya bien
    const contractStart = career.contractStart || career.startedSeason || season;
    const seasonsServed = season - contractStart + 1;
    const contractEnd = !fired && seasonsServed >= (career.contractSeasons || CONTRACT_SEASONS);
    // Clasificación europea para la próxima Champions global
    const clQualified = career.div === 1 && position <= CL_SPOTS;
    const badSeason = objectivesMet === 0 || performance.score <= -2;
    const badStreak = badSeason ? (career.badStreak || 0) + 1 : 0;

    const kind = fired ? 'fired' : contractEnd ? 'renewal' : 'performance';
    const leagueNames = Object.fromEntries(LEAGUE_IDS.map(id => [id, comps[id]?.name]));
    // Las ofertas dependen de reputación + objetivos cumplidos: como mucho un
    // Tier por encima, y tras un despido sólo proyectos menores (o ninguno).
    const offers = buildOffers({
      comps, career, performance, reputation: repAfter, season, leagueNames, kind, objectivesMet
    });

    // Los PE ganados nunca exceden lo que aún puede mejorarse en el club
    const peRoom = Math.max(0, remainingUpgradeCost(careerTeam, newTier) - (career.pe || 0));
    const peGain = maxed ? 0 : Math.min(objective.pe, peRoom);

    return {
      season, teamName: careerTeam.name, compName: careerComp?.name, position, expected,
      performance: performance.label, note: objective.note,
      repDelta, repAfter, peGain, peRoom, promote: !!objective.promote, newTier,
      currentTier: career.tier || 1,
      fired, contractEnd, offers, clQualified, clResult, objectivesMet,
      objectivesTotal: coreObjectives.length, badStreak,
      unemployed: fired && offers.length === 0
    };
  };

  const openCareerReview = () => {
    if (careerReview) return;
    const season = seasonState.season || 1;
    // Una vez firmado (renovación o club nuevo) no se vuelve a abrir el balance
    if (career.signedForSeason === season) return;
    if (career.lastProcessedSeason === season) return;
    const review = buildCareerReview();
    if (!review) return;
    setCareerReview(review);
    setCareer(c => ({
      ...c,
      reputation: review.repAfter,
      // Al ser despedido pierdes el trabajo hecho en el club: los PE no viajan
      pe: review.fired ? 0 : capPE(c.pe + review.peGain, careerTeam, review.newTier),
      tier: review.newTier,
      fired: review.fired,
      badStreak: review.badStreak,
      offers: review.offers,
      seasonLog: [],
      clQualifiedFor: review.clQualified ? review.season + 1 : null,
      lastProcessedSeason: review.season,
      trophies: {
        leagues: (c.trophies?.leagues || 0) + (review.position === 1 ? 1 : 0),
        champions: (c.trophies?.champions || 0) + (review.clResult?.includes('Campeón') ? 1 : 0),
        promotions: (c.trophies?.promotions || 0) + (c.div === 2 && review.position <= 3 ? 1 : 0)
      },
      seasonHistory: [
        {
          season: review.season, teamName: review.teamName, compName: review.compName,
          div: c.div, pts: careerTeam?.pts || 0,
          position: review.position, performance: review.performance,
          repAfter: review.repAfter, note: review.note,
          objectivesMet: review.objectivesMet, objectivesTotal: review.objectivesTotal,
          clResult: review.clResult, promoted: c.div === 2 && review.position <= 3,
          fired: review.fired
        },
        ...(c.seasonHistory || [])
      ]
    }));
  };

  // Firmar por un club nuevo: contrato limpio, sin rastro del despido anterior.
  // La reputación viaja contigo y da un plus si el club es mayor.
  // El club previo recupera sus estadísticas de fuerza originales.
  const acceptCareerOffer = (offer) => {
    // Si el entrenador cambia de club, el club que entrenaba recupera sus estadísticas de fuerza originales
    if (career.teamId && career.originalTeamStats && career.originalTeamStats.teamId === career.teamId) {
      const prevCompId = career.compId || career.originalTeamStats.compId;
      const prevTeamsKey = (career.div === 2 || career.originalTeamStats.div === 2) ? 'teams2' : 'teams';
      setComps(prev => {
        const comp = prev[prevCompId];
        if (!comp) return prev;
        return {
          ...prev,
          [prevCompId]: {
            ...comp,
            [prevTeamsKey]: (comp[prevTeamsKey] || []).map(t =>
              t.id === career.teamId
                ? { ...t, att: career.originalTeamStats.att, opp: career.originalTeamStats.opp, def: career.originalTeamStats.def }
                : t
            )
          }
        };
      });
    }

    const teams = offer.div === 2 ? comps[offer.compId]?.teams2 : comps[offer.compId]?.teams;
    const team = (teams || []).find(t => t.id === offer.teamId);
    const season = seasonState.season || 1;
    const bonus = signingRepBonus({
      fromTier: career.tier || 1,
      toTier: offer.tier || 1,
      fromStrength: (careerTeam?.att || 0) + (careerTeam?.opp || 0) + (careerTeam?.def || 0),
      toStrength: (team?.att || 0) + (team?.opp || 0) + (team?.def || 0)
    });
    setCareer(c => ({
      ...c,
      active: true,
      compId: offer.compId, div: offer.div, teamId: offer.teamId,
      tier: offer.tier, pe: 0, fired: false, offers: [], seasonLog: [],
      activeApplication: null,
      transferredInSeason: season,
      reputation: clampRep(c.reputation + bonus),
      signingBonus: bonus,
      clQualifiedFor: null, badStreak: 0,
      contractStart: season + 1,
      contractSeasons: CONTRACT_SEASONS,
      signedForSeason: season,
      lastProcessedSeason: c.lastProcessedSeason,
      medicalImmunityWeeks: 0,
      trainedMatchday: -1,
      completedOfficeWeeks: [],
      activeInjury: null,
      lastSimulationFeedback: null,
      originalTeamStats: team ? {
        teamId: team.id,
        compId: offer.compId,
        div: offer.div,
        att: team.att,
        opp: team.opp,
        def: team.def
      } : null,
      baseDist: team ? { att: team.att, opp: team.opp, def: team.def } : c.baseDist,
      tactic: team ? { att: team.att, opp: team.opp, def: team.def } : c.tactic
    }));
    setCareerReview(null);
    setView('career');
  };

  // Renovar contrato en el club actual
  const renewCareerContract = () => {
    const season = seasonState.season || 1;
    setCareer(c => ({
      ...c,
      contractStart: season + 1,
      contractSeasons: CONTRACT_SEASONS,
      fired: false,
      offers: [],
      signedForSeason: season,
      activeApplication: null,
      completedOfficeWeeks: [],
      trainedMatchday: -1,
      medicalImmunityWeeks: 0,
      activeInjury: null,
      lastSimulationFeedback: null,
      seasonLog: []
    }));
    setCareerReview(null);
    setView('career');
  };

  const closeCareerReview = () => {
    setCareerReview(null);
    setView('career');
  };

  // Avanzar una semana de oficina (mercado o parón internacional)
  const advanceCareerOfficeWeek = (officeWeekNum) => {
    setCareer(c => {
      const completed = [...(c.completedOfficeWeeks || [])];
      if (!completed.includes(officeWeekNum)) {
        completed.push(officeWeekNum);
      }

      let updatedActiveApp = c.activeApplication;
      let updatedAppHistory = c.applicationHistory || [];
      let appResolutionModal = null;
      let newOffer = null;

      if (updatedActiveApp && updatedActiveApp.status === 'review') {
        const remaining = (updatedActiveApp.weeksRemaining ?? 2) - 1;
        if (remaining <= 0) {
          const currentComp = comps[c.compId];
          const currentTeams = currentComp ? (c.div === 2 ? currentComp.teams2 : currentComp.teams) || [] : [];
          const expPos = expectedPosition(currentTeams, c.teamId);
          const sortedAfter = [...currentTeams].sort((a, b) => (b.pts || 0) - (a.pts || 0) || ((b.gf || 0) - (b.ga || 0)) - ((a.gf || 0) - (a.ga || 0)));
          const posIdx = sortedAfter.findIndex(t => t.id === c.teamId);
          const currentPos = posIdx >= 0 ? posIdx + 1 : expPos;
          const currentPerf = readPerformance(currentPos, expPos);
          const hasRecentHistoryBonus = (c.trophies?.leagues || 0) > 0 || (c.trophies?.champions || 0) > 0 || (c.trophies?.promotions || 0) > 0;

          const evalRes = evaluateApplication({
            clubTier: updatedActiveApp.tier || 1,
            reputation: c.reputation || 10,
            performanceScore: currentPerf?.score || 0,
            position: currentPos,
            expected: expPos,
            hasRecentHistoryBonus
          });

          if (evalRes.accepted) {
            newOffer = {
              id: `${seasonState.season || 1}-${updatedActiveApp.compId}-${updatedActiveApp.div}-${updatedActiveApp.teamId}`,
              season: seasonState.season || 1,
              compId: updatedActiveApp.compId,
              compName: updatedActiveApp.compName,
              div: updatedActiveApp.div,
              teamId: updatedActiveApp.teamId,
              teamName: updatedActiveApp.teamName,
              color1: updatedActiveApp.color1,
              color2: updatedActiveApp.color2,
              isFlag: updatedActiveApp.isFlag,
              tier: updatedActiveApp.tier,
              standingStatus: updatedActiveApp.standingStatus || 'Media Tabla',
              requiredObjective: updatedActiveApp.requiredObjective || 'Cumplir los objetivos de la directiva',
              profile: updatedActiveApp.tier >= 4 ? 'Gigante de Primera' : updatedActiveApp.tier === 3 ? 'Top 6 / Europa' : 'Proyecto Deportivo',
              seasons: CONTRACT_SEASONS,
              reason: 'Candidatura formal aceptada por la junta directiva tras 2 semanas de evaluación.',
              fromApplication: true,
              weeksRemaining: 2
            };
            updatedAppHistory = [
              {
                id: `app-res-${Date.now()}`,
                teamName: updatedActiveApp.teamName,
                compName: updatedActiveApp.compName,
                tier: updatedActiveApp.tier,
                matchday: careerMd,
                accepted: true,
                message: evalRes.message,
                rejectionType: null
              },
              ...updatedAppHistory
            ].slice(0, 30);
            appResolutionModal = {
              accepted: true,
              teamName: updatedActiveApp.teamName,
              compName: updatedActiveApp.compName,
              tier: updatedActiveApp.tier,
              color1: updatedActiveApp.color1,
              color2: updatedActiveApp.color2,
              isFlag: updatedActiveApp.isFlag,
              message: evalRes.message,
              offer: newOffer
            };
            updatedActiveApp = null;
          } else {
            updatedAppHistory = [
              {
                id: `app-res-${Date.now()}`,
                teamName: updatedActiveApp.teamName,
                compName: updatedActiveApp.compName,
                tier: updatedActiveApp.tier,
                matchday: careerMd,
                accepted: false,
                message: evalRes.message,
                rejectionType: evalRes.rejectionType
              },
              ...updatedAppHistory
            ].slice(0, 30);
            appResolutionModal = {
              accepted: false,
              teamName: updatedActiveApp.teamName,
              compName: updatedActiveApp.compName,
              tier: updatedActiveApp.tier,
              color1: updatedActiveApp.color1,
              color2: updatedActiveApp.color2,
              isFlag: updatedActiveApp.isFlag,
              message: evalRes.message,
              rejectionType: evalRes.rejectionType
            };
            updatedActiveApp = null;
          }
        } else {
          updatedActiveApp = {
            ...updatedActiveApp,
            weeksRemaining: remaining
          };
        }
      }

      // Caducidad de ofertas en el buzón: solo se quedan por 2 semanas y luego se limpia el buzón
      const prunedOffers = (c.offers || []).map(o => {
        const currentWeeks = typeof o.weeksRemaining === 'number' ? o.weeksRemaining : 2;
        return { ...o, weeksRemaining: currentWeeks - 1 };
      }).filter(o => o.weeksRemaining > 0);

      const finalOffers = newOffer
        ? [newOffer, ...prunedOffers.filter(o => o.id !== newOffer.id)]
        : prunedOffers;

      return {
        ...c,
        completedOfficeWeeks: completed,
        activeApplication: updatedActiveApp,
        offers: finalOffers,
        applicationHistory: updatedAppHistory,
        pendingAppResolutionModal: appResolutionModal || c.pendingAppResolutionModal
      };
    });
  };

  // Postulación activa a un club vacante (máximo 1 activa, evaluación a ciegas de 2 semanas)
  const submitCareerApplication = (vacancy) => {
    if (!vacancy) return;
    const season = seasonState.season || 1;
    setCareer(c => {
      if (c.activeApplication) return c; // Límite: máximo 1 postulación activa a la vez
      if (c.transferredInSeason === season || c.signedForSeason === season) return c; // Ya firmó en esta temporada
      return {
        ...c,
        activeApplication: {
          teamId: vacancy.teamId,
          teamName: vacancy.teamName,
          compId: vacancy.compId,
          compName: vacancy.compName,
          div: vacancy.div,
          tier: vacancy.tier,
          color1: vacancy.color1,
          color2: vacancy.color2,
          isFlag: vacancy.isFlag,
          standingStatus: vacancy.standingStatus,
          requiredObjective: vacancy.requiredObjective,
          submittedMatchday: careerMd,
          weeksRemaining: 2,
          status: 'review'
        }
      };
    });
  };

  // Si la temporada del club acabó, el balance se ofrece una sola vez por temporada.
  // Si el club está clasificado para la Champions global, el balance espera a que
  // su recorrido europeo esté resuelto para que cuente en la valoración.
  useEffect(() => {
    if (!career.active || !careerTeam) return;
    if (!careerDivisionFinished) return;
    if (career.lastProcessedSeason === (seasonState.season || 1)) return;
    if (career.signedForSeason === (seasonState.season || 1)) return;
    if (view !== 'career') return;
    const playsCl = career.clQualifiedFor === (seasonState.season || 1) || !!careerClInfo;
    if (playsCl && !(careerClInfo?.champion || careerClInfo?.eliminated)) return;
    openCareerReview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [career.active, careerDivisionFinished, seasonState.season, view, careerClInfo]);


  // El club puede ascender o descender de división: la carrera sigue al equipo
  // y el reseteo de puntos/estadísticas se aplica siempre, lo quiera o no el técnico
  useEffect(() => {
    if (!career.active || !career.teamId) return;
    const comp = comps[career.compId];
    if (!comp) return;
    const inCurrent = (career.div === 2 ? comp.teams2 : comp.teams)?.some(t => t.id === career.teamId);
    if (inCurrent) return;
    const otherDiv = career.div === 2 ? 1 : 2;
    const otherTeams = otherDiv === 2 ? comp.teams2 : comp.teams;
    const moved = otherTeams?.find(t => t.id === career.teamId);
    if (!moved) return;
    const teamsKey = otherDiv === 2 ? 'teams2' : 'teams';
    // Reseteo obligatorio de puntos y estadísticas del club al cambiar de división
    setComps(prev => ({
      ...prev,
      [career.compId]: {
        ...prev[career.compId],
        [teamsKey]: (prev[career.compId]?.[teamsKey] || []).map(t =>
          t.id === career.teamId ? { ...t, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 } : t
        )
      }
    }));
    setCareer(c => ({
      ...c,
      div: otherDiv,
      tier: tierOf(moved),
      seasonLog: [],
      baseDist: { att: moved.att, opp: moved.opp, def: moved.def },
      tactic: { att: moved.att, opp: moved.opp, def: moved.def }
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comps, career.active, career.compId, career.div, career.teamId]);


  // Resuelve la ronda/jornada actual de una copa o mundial.
  // `ms` = resultado jugado manualmente por el usuario, o null para simular TODO.
  const processCupRound = (ms?: any, targetCompId?: string, isAutoSimManual?: boolean) => {
    const cId = targetCompId || activeCompId;
    const currentComp = comps[cId];
    if (!currentComp || currentComp.type === 'league') return;
    const isAutoSim = isAutoSimManual ?? (!ms && cupAutoSim);
    // Copas y Mundiales mantienen la lógica original sin divisiones múltiples
    const results: any[] = ms
      ? [{ hId: ms.home.id, aId: ms.away.id, sh: ms.scoreH, sa: ms.scoreA, penH: ms.penalties?.scoreH, penA: ms.penalties?.scoreA }]
      : [];
    if (currentComp.phase === 'groups') {
       const isWorldCup = cId === 'C2';
       const maxMatchdays = isWorldCup ? 3 : 6;
       currentComp.groups.forEach(group => {
          const groupTeams = currentComp.teams.filter(t => group.teamIds.includes(t.id));
          const currentRound = generateLeagueSchedule(groupTeams, !isWorldCup)[currentComp.matchday % maxMatchdays];
          if (currentRound) {
             currentRound.forEach(m => {
                const isUserMatch = ms && (m.homeId === currentComp.userTeamId || m.awayId === currentComp.userTeamId || m.homeId === ms.home?.id || m.awayId === ms.home?.id);
                if (!isUserMatch) {
                   const h = currentComp.teams.find(t => t.id === m.homeId); const a = currentComp.teams.find(t => t.id === m.awayId);
                   let sh = 0, sa = 0;
                   for(let i=0; i<h.opp; i++) if(Math.floor(Math.random()*6)+1 <= h.att && Math.floor(Math.random()*6)+1 > a.def) sh++;
                   for(let i=0; i<a.opp; i++) if(Math.floor(Math.random()*6)+1 <= a.att && Math.floor(Math.random()*6)+1 > h.def) sa++;
                   results.push({ hId: m.homeId, aId: m.awayId, sh, sa, penH: null, penA: null });
                }
             });
          }
       });
       const updatedTeams = currentComp.teams.map(t => {
          const res = results.find(r => r.hId === t.id || r.aId === t.id);
          if (!res) return t;
          const isHome = res.hId === t.id;
          const gf = isHome ? res.sh : res.sa; const ga = isHome ? res.sa : res.sh;
          const w = gf > ga ? 1 : 0; const d = gf === ga ? 1 : 0; const l = gf < ga ? 1 : 0;
          return { ...t, p: t.p + 1, w: t.w + w, d: t.d + d, l: t.l + l, gf: t.gf + gf, ga: t.ga + ga, pts: t.pts + (w * 3 + d) };
       });
       const nextMatchday = currentComp.matchday + 1;
       const isEndOfGroups = nextMatchday >= maxMatchdays;
       let newBracket = null;
       if (isEndOfGroups) newBracket = generateKnockoutBrackets({ ...currentComp, teams: updatedTeams });
        const updatedComp = { teams: updatedTeams, history: [{ day: 'Jornada ' + nextMatchday, results }, ...currentComp.history], matchday: nextMatchday, phase: isEndOfGroups ? (newBracket.Octavos ? 'Octavos' : 'Cuartos') : 'groups', bracket: newBracket };
        updateCompById(cId, updatedComp);

        // Check if user's team was eliminated in group stage (solo en vista standalone de competición)
        if (isEndOfGroups && cId === activeCompId) {
          const userTeamId = currentComp.userTeamId;
          const userGroup = currentComp.groups.find(g => g.teamIds.includes(userTeamId));
          if (userGroup) {
            const groupTeams = updatedTeams.filter(t => userGroup.teamIds.includes(t.id)).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));
            const userPos = groupTeams.findIndex(t => t.id === userTeamId);
            if (userPos >= 2) {
              if (isAutoSim) {
                // En "Simular Todo" no interrumpimos: adoptamos automáticamente un clasificado
                const qualified = currentComp.groups.flatMap(g => {
                  const gt = updatedTeams.filter(t => g.teamIds.includes(t.id)).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));
                  return gt.slice(0, 2).map(t => t.id);
                }).filter(id => id !== userTeamId);
                if (qualified.length) updateCompById(cId, { userTeamId: qualified[Math.floor(Math.random() * qualified.length)] });
              } else {
                setTimeout(() => setEliminatedModal({ compId: activeCompId, phase: 'Fase de Grupos' }), 500);
              }
            }
          }
        }

    } else {
       // Eliminatorias
       const isChampions = cId === 'C1';
       const phase = currentComp.phase;
       const isVuelta = isChampions && currentComp.matchday % 2 !== 0 && phase !== 'Final';
       const newBracket = { ...currentComp.bracket };
       const matchesToProcess = Array.isArray(newBracket[phase]) ? newBracket[phase] : [newBracket[phase]];
       const allResults = [];

       matchesToProcess.forEach(m => {
          let sh, sa, penH, penA;
          if (ms && m.hId === ms.home.id && m.aId === ms.away.id) { sh = ms.scoreH; sa = ms.scoreA; penH = ms.penalties?.scoreH; penA = ms.penalties?.scoreA; } 
          else if (ms && isVuelta && m.hId === ms.away.id && m.aId === ms.home.id) { sh = ms.scoreA; sa = ms.scoreH; penH = ms.penalties?.scoreA; penA = ms.penalties?.scoreH; } 
          else {
             const h = currentComp.teams.find(t => t.id === (isVuelta ? m.aId : m.hId)); const a = currentComp.teams.find(t => t.id === (isVuelta ? m.hId : m.aId));
             let simH = 0, simA = 0;
             for(let i=0; i<h.opp; i++) if(Math.floor(Math.random()*6)+1 <= h.att && Math.floor(Math.random()*6)+1 > a.def) simH++;
             for(let i=0; i<a.opp; i++) if(Math.floor(Math.random()*6)+1 <= a.att && Math.floor(Math.random()*6)+1 > h.def) simA++;
             if (isVuelta) { sh = simA; sa = simH; } else { sh = simH; sa = simA; }
             const isDraw = (isChampions && isVuelta && phase !== 'Final') ? (m.sh + sh === m.sa + sa) : (sh === sa);
             if (isDraw && (!isChampions || isVuelta || phase === 'Final')) {
                let spH=0, spA=0, shH=0, shA=0;
                const sim = (att, def) => (Math.floor(Math.random()*6)+1 <= att && Math.floor(Math.random()*6)+1 > def);
                for(let i=0; i<5; i++){
                   if(sim(h.att, a.def)) spH++; shH++;
                   if(spH > spA + (5-shA) || spA > spH + (5-shH)) break;
                   if(sim(a.att, h.def)) spA++; shA++;
                   if(spH > spA + (5-shA) || spA > spH + (5-shH)) break;
                }
                while(spH===spA){ if(sim(h.att, a.def)) spH++; if(sim(a.att, h.def)) spA++; }
                penH = spH; penA = spA;
             }
          }
          if (isVuelta) { m.sh2 = sh; m.sa2 = sa; } else { m.sh = sh; m.sa = sa; }
          if (penH !== undefined) { m.penH = penH; m.penA = penA; }
          allResults.push(isVuelta ? { hId: m.aId, aId: m.hId, sh: sa, sa: sh, penH: penA, penA: penH } : { hId: m.hId, aId: m.aId, sh, sa, penH, penA });
       });

       let nextPhase = phase, showWinner = false;
       if (!isChampions || isVuelta || phase === 'Final') {
          const winners = matchesToProcess.map(m => {
             const tH = isChampions && phase!=='Final' ? m.sh+m.sh2 : m.sh; const tA = isChampions && phase!=='Final' ? m.sa+m.sa2 : m.sa;
             if(tH>tA) return m.hId; if(tA>tH) return m.aId; return m.penH>m.penA ? m.hId : m.aId;
          });
          if (phase === 'Octavos') { nextPhase = 'Cuartos'; newBracket.Cuartos = Array(4).fill(0).map((_, i) => ({ id: 'C'+(i+1), hId: winners[i*2], aId: winners[i*2+1], sh: null, sa: null, penH: null, penA: null, sh2: null, sa2: null })); } 
          else if (phase === 'Cuartos') { nextPhase = 'Semis'; newBracket.Semis = Array(2).fill(0).map((_, i) => ({ id: 'S'+(i+1), hId: winners[i*2], aId: winners[i*2+1], sh: null, sa: null, penH: null, penA: null, sh2: null, sa2: null })); } 
          else if (phase === 'Semis') { nextPhase = 'Final'; newBracket.Final = [{ id: 'F1', hId: winners[0], aId: winners[1], sh: null, sa: null, penH: null, penA: null, sh2: null, sa2: null }]; } 
          else { nextPhase = 'Terminado'; showWinner = true; }
       }
        const updatedComp = { history: [{ day: phase + (isChampions ? (isVuelta ? ' (Vuelta)' : ' (Ida)') : ''), results: allResults }, ...currentComp.history], matchday: currentComp.matchday + 1, phase: nextPhase, bracket: newBracket, showWinner };
        updateCompById(cId, updatedComp);
        if (showWinner) archiveCompetition(cId, 1);

        // Check if user's team was eliminated in knockout (solo en vista standalone)
        if ((!isChampions || isVuelta || phase === 'Final') && cId === activeCompId) {
          const userTeamId = currentComp.userTeamId;
          const winners = matchesToProcess.map(m => {
            const tH = isChampions && phase!=='Final' ? m.sh+m.sh2 : m.sh; const tA = isChampions && phase!=='Final' ? m.sa+m.sa2 : m.sa;
            if(tH>tA) return m.hId; if(tA>tH) return m.aId; return m.penH>m.penA ? m.hId : m.aId;
          });
          const wasInThisRound = matchesToProcess.some(m => m.hId === userTeamId || m.aId === userTeamId);
          const userAdvanced = winners.includes(userTeamId);
         if (wasInThisRound && !userAdvanced && !showWinner) {
            if (isAutoSim) {
              const alive = winners.filter(id => id !== userTeamId);
              if (alive.length) updateCompById(cId, { userTeamId: alive[Math.floor(Math.random() * alive.length)] });
            } else {
              setTimeout(() => setEliminatedModal({ compId: activeCompId, phase }), 500);
            }
          }
        }
    }
  };

  const processMatchday = () => {
    if (activeComp.type === 'league') {
      const isDiv2Context = matchState.isDiv2Context;
      const tArray = isDiv2Context ? activeComp.teams2 : activeComp.teams;
      const tMatchday = isDiv2Context ? activeComp.matchday2 : activeComp.matchday;
      const tHistory = isDiv2Context ? activeComp.history2 : activeComp.history;

      const schedule = generateLeagueSchedule(tArray);
      const currentRound = Array.isArray(schedule) ? schedule[tMatchday] : [];

      const results = currentRound.map((m: any) => {
        if (m.homeId === matchState.home.id || m.awayId === matchState.home.id || m.homeId === matchState.away.id || m.awayId === matchState.away.id) {
          if(m.homeId === matchState.home.id) return { hId: m.homeId, aId: m.awayId, sh: matchState.scoreH, sa: matchState.scoreA };
          if(m.homeId === matchState.away.id) return { hId: m.homeId, aId: m.awayId, sh: matchState.scoreA, sa: matchState.scoreH };
        }
        const h = tArray.find((t: any) => t.id === m.homeId); const a = tArray.find((t: any) => t.id === m.awayId);
        let sh = 0, sa = 0;
        for(let i=0; i<(h?.opp||0); i++) if(Math.floor(Math.random()*6)+1 <= (h?.att||0) && Math.floor(Math.random()*6)+1 > (a?.def||0)) sh++;
        for(let i=0; i<(a?.opp||0); i++) if(Math.floor(Math.random()*6)+1 <= (a?.att||0) && Math.floor(Math.random()*6)+1 > (h?.def||0)) sa++;
        return { hId: m.homeId, aId: m.awayId, sh, sa };
      });

      const updatedTeams = tArray.map((t: any) => {
        const res = results.find((r: any) => r.hId === t.id || r.aId === t.id);
        if (!res) return t;
        const isHome = res.hId === t.id;
        const gf = isHome ? res.sh : res.sa; const ga = isHome ? res.sa : res.sh;
        const w = gf > ga ? 1 : 0; const d = gf === ga ? 1 : 0; const l = gf < ga ? 1 : 0;
        return { ...t, p: t.p + 1, w: t.w + w, d: t.d + d, l: t.l + l, gf: t.gf + gf, ga: t.ga + ga, pts: t.pts + (w * 3 + d) };
      });

      const isFinished = tMatchday === schedule.length - 1;
      const nextMatchday = tMatchday + 1;
      const newHistory = [{ day: tMatchday + 1, results }, ...tHistory];

      // Datos de la división que el usuario jugó
      const playedDivUpdate: any = {};
      if (isDiv2Context) {
        playedDivUpdate.teams2 = updatedTeams;
        playedDivUpdate.history2 = newHistory;
        playedDivUpdate.matchday2 = nextMatchday;
        playedDivUpdate.showWinner2 = isFinished;
      } else {
        playedDivUpdate.teams = updatedTeams;
        playedDivUpdate.history = newHistory;
        playedDivUpdate.matchday = nextMatchday;
        playedDivUpdate.showWinner = isFinished;
      }

      // Simular simultáneamente la OTRA división
      const otherTeams = isDiv2Context ? activeComp.teams : activeComp.teams2;
      const otherMatchday = isDiv2Context ? activeComp.matchday : activeComp.matchday2;
      const otherHistory = isDiv2Context ? activeComp.history : activeComp.history2;
      const otherSchedule = generateLeagueSchedule(otherTeams);
      const otherNotFinished = otherMatchday < otherSchedule.length;

      if (otherTeams && otherTeams.length > 0 && otherNotFinished) {
        const otherResult = simulateDivisionMatchday(otherTeams, otherMatchday, otherHistory);
        if (otherResult) {
          if (isDiv2Context) {
            playedDivUpdate.teams = otherResult.updatedTeams;
            playedDivUpdate.history = otherResult.newHistory;
            playedDivUpdate.matchday = otherResult.nextMatchday;
            playedDivUpdate.showWinner = otherResult.isFinished;
          } else {
            playedDivUpdate.teams2 = otherResult.updatedTeams;
            playedDivUpdate.history2 = otherResult.newHistory;
            playedDivUpdate.matchday2 = otherResult.nextMatchday;
            playedDivUpdate.showWinner2 = otherResult.isFinished;
          }
        }
      }

      updateActiveComp(playedDivUpdate);
      // JORNADA GLOBAL SINCRONIZADA: el resultado manual queda registrado tal cual
      // y las demás ligas resuelven automáticamente esta misma jornada global.
      simulateOtherLeaguesToGlobal(activeCompId);


    } else {
       processCupRound(matchState);
    }
    setCompView('main');
  };

  // Simulación automática de copas/mundiales hasta el campeón
  useEffect(() => {
    if (!cupAutoSim) return;
    if (!activeComp || activeComp.type === 'league') { setCupAutoSim(false); return; }
    if (activeComp.showWinner || activeComp.phase === 'Terminado') { setCupAutoSim(false); return; }
    if (compView !== 'main') return;
    const t = setTimeout(() => processCupRound(null), 420);
    return () => clearTimeout(t);
  }, [cupAutoSim, activeComp, compView]);

  const handlePromotionAndNewSeason = () => {
    if (activeComp.type !== 'league') return;

    // Archivamos a los campeones
    archiveCompetition(activeCompId, 1);
    archiveCompetition(activeCompId, 2);

    const sorted1 = [...activeComp.teams].sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));
    const sorted2 = [...activeComp.teams2].sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));

    const bottom3 = sorted1.slice(-3); // Descienden (18, 19, 20)
    const top3 = sorted2.slice(0, 3); // Ascienden (1, 2, 3)

    // Mecánica original de herencia de stats al ascender/descender
    const origStats = bottom3.map(t => ({ att: t.att, opp: t.opp, def: t.def }));
    const boostedRelegated = [
      { ...bottom3[0], att: 5, opp: 5, def: 3 },
      { ...bottom3[1], att: 4, opp: 4, def: 4 },
      { ...bottom3[2], att: 3, opp: 4, def: 3 }
    ];
    const adjustedPromoted = [
      { ...top3[0], att: origStats[0].att, opp: origStats[0].opp, def: origStats[0].def },
      { ...top3[1], att: origStats[1].att, opp: origStats[1].opp, def: origStats[1].def },
      { ...top3[2], att: origStats[2].att, opp: origStats[2].opp, def: origStats[2].def }
    ];
    const resetStats = (t) => ({ ...t, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 });

    const remaining1 = sorted1.slice(0, -3).map(resetStats);
    const remaining2 = sorted2.slice(3).map(resetStats);

    const nextTeams1 = [...remaining1, ...adjustedPromoted.map(resetStats)];
    const nextTeams2 = [...remaining2, ...boostedRelegated.map(resetStats)];

    const seasonNow = seasonState.season || 1;
    const rec1 = buildSeasonRecord(activeComp.teams, seasonNow);
    const rec2 = buildSeasonRecord(activeComp.teams2, seasonNow);

    updateActiveComp({
      championsHistory: pushRecord(rec1, activeComp.championsHistory),
      championsHistory2: pushRecord(rec2, activeComp.championsHistory2),
      // Guardamos la tabla final terminada como "anterior competición" (una sola, reemplaza a la previa)
      previousStandings: buildStandingsSnapshot(activeComp.teams),
      previousStandings2: buildStandingsSnapshot(activeComp.teams2),
      teams: nextTeams1,
      teams2: nextTeams2,
      matchday: 0,
      matchday2: 0,
      history: [],
      history2: [],
      showWinner: false,
      showWinner2: false
    });


  };

  const handleTotalReset = (compId) => {
    const defaultData = getDefaultComps()[compId];
    updateActiveComp({
      teams: defaultData.teams,
      teams2: defaultData.teams2,
      matchday: 0, matchday2: 0, history: [], history2: [],
      showWinner: false, showWinner2: false, phase: defaultData.phase, bracket: null
    });
    setCompView('main');
  };

  const CompetitionView = () => {
    if (!activeComp) return null;
    const hasStarted = activeComp.type === 'league' 
      ? (activeComp.matchday > 0 || activeComp.matchday2 > 0 || activeComp.history?.length > 0)
      : (activeComp.matchday > 0 || activeComp.history?.length > 0);

    const isLeague = activeComp.type === 'league';
    const isDiv2 = viewDiv === 2 && isLeague;

    // Selectores dinámicos basados en la división actual
    const currentTeams = isDiv2 ? activeComp.teams2 : activeComp.teams;
    const currentMatchday = isDiv2 ? activeComp.matchday2 : activeComp.matchday;
    const currentHistory = isDiv2 ? activeComp.history2 : activeComp.history;
    const currentShowWinner = isDiv2 ? activeComp.showWinner2 : activeComp.showWinner;

    if (!currentTeams || currentTeams.length === 0) {
      return (
        <div className='flex-grow flex flex-col items-center justify-center text-center p-8'>
          <div className='w-24 h-24 bg-slate-900/30 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 border border-white/10 shadow-2xl'><Trophy size={48} className='text-slate-400' /></div>
          <h2 className='text-3xl font-black italic uppercase mb-2 text-white drop-shadow-md'>{activeComp?.name}</h2>
          <p className='text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-10 drop-shadow-md'>Faltan equipos en {isDiv2 ? '2ª' : '1ª'} División.</p>
          <div className='space-y-4 w-full max-w-xs'>
            {!isLeague && (
              <>
                <button onClick={() => {
                   const compsState = JSON.parse(window.localStorage.getItem(`${APP_ID}_comps`));
                   updateActiveComp(getAutoFillData(activeCompId, compsState));
                }} className='w-full bg-blue-600/80 backdrop-blur-md hover:bg-blue-500 text-white py-4 rounded-2xl text-[11px] font-black uppercase italic tracking-widest shadow-xl transition-all active:scale-95 flex justify-center items-center gap-2'>
                  <Wand2 size={16}/> Auto-Rellenar
                </button>
                <button onClick={() => {
                   const compsState = JSON.parse(window.localStorage.getItem(`${APP_ID}_comps`));
                   updateActiveComp(getShuffleData(activeCompId, compsState));
                }} className='w-full bg-emerald-600/80 backdrop-blur-md hover:bg-emerald-500 text-white py-4 rounded-2xl text-[11px] font-black uppercase italic tracking-widest shadow-xl transition-all active:scale-95 flex justify-center items-center gap-2'>
                  <Shuffle size={16}/> Sorteo Dinámico
                </button>
              </>
            )}
            <button onClick={() => setView('hub')} className='w-full bg-slate-900/40 backdrop-blur-md border border-white/10 text-slate-200 py-4 rounded-2xl text-[11px] font-black uppercase italic tracking-widest transition-all active:scale-95'>Volver al Inicio</button>
          </div>
        </div>
      );
    }

    const sortedTeams = [...currentTeams].sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));

    const currentUserTeamId = isDiv2 ? (activeComp.userTeamId2 || activeComp.teams2?.[0]?.id) : activeComp.userTeamId;
    const userTeam = currentTeams.find(t => t.id === currentUserTeamId) || currentTeams[0];

    const winner = useMemo(() => {
      if (!currentTeams || currentTeams.length === 0) return null;
      if (isLeague) return sortedTeams[0];
      const final = activeComp.bracket?.Final?.[0] || activeComp.bracket?.Final;
      if (final && final.sh !== null) {
        if (final.sh > final.sa) return activeComp.teams.find(t => t.id === final.hId);
        if (final.sa > final.sh) return activeComp.teams.find(t => t.id === final.aId);
        return activeComp.teams.find(t => t.id === (final.penH > final.penA ? final.hId : final.aId));
      }
      return currentTeams[0];
    }, [activeComp, currentTeams, isLeague, sortedTeams]);

    useEffect(() => {
      if (!isLeague && activeComp.phase !== 'groups' && !activeComp.bracket) {
        const newBracket = generateKnockoutBrackets(activeComp);
        if (newBracket) updateActiveComp({ bracket: newBracket });
      }
    }, [activeComp?.phase, activeComp?.bracket, isLeague]);

    const getGroupMatch = () => {
      if (!currentTeams || currentTeams.length === 0) return null;
      if (isLeague) return (generateLeagueSchedule(currentTeams)[currentMatchday] || []).find(m => m.homeId === userTeam.id || m.awayId === userTeam.id);

      if (activeComp.phase === 'groups' && activeComp.groups) {
        const isWC = activeCompId === 'C2';
        const group = activeComp.groups.find(g => g.teamIds.includes(userTeam.id));
        if (group) return (generateLeagueSchedule(activeComp.teams.filter(t => group.teamIds.includes(t.id)), !isWC)[activeComp.matchday % (isWC ? 3 : 6)] || []).find(m => m.homeId === userTeam.id || m.awayId === userTeam.id);
        for (const g of activeComp.groups) {
          const m = (generateLeagueSchedule(activeComp.teams.filter(t => g.teamIds.includes(t.id)), !isWC)[activeComp.matchday % (isWC ? 3 : 6)] || [])[0];
          if (m) return m;
        }
      } else if (activeComp.bracket) {
        const matchArray = Array.isArray(activeComp.bracket[activeComp.phase]) ? activeComp.bracket[activeComp.phase] : [activeComp.bracket[activeComp.phase]];
        const isVuelta = activeCompId === 'C1' && activeComp.matchday % 2 !== 0 && activeComp.phase !== 'Final';
        const userMatch = matchArray.find(m => m && (m.hId === userTeam.id || m.aId === userTeam.id));
        if (userMatch) return (isVuelta && userMatch.sh2 === null) || (!isVuelta && userMatch.sh === null) ? userMatch : null;
        return matchArray.find(m => m && (isVuelta ? m.sh2 === null : m.sh === null));
      }
      return null;
    };

    const currentMatch = getGroupMatch();
    let homeId = currentMatch?.homeId || currentMatch?.hId;
    let awayId = currentMatch?.awayId || currentMatch?.aId;

    if (activeCompId === 'C1' && activeComp.matchday % 2 !== 0 && activeComp.phase !== 'Final' && activeComp.phase !== 'groups' && currentMatch?.hId) {
      const temp = homeId; homeId = awayId; awayId = temp;
    }

    const homeTeam = currentTeams.find(t => t.id === homeId);
    const awayTeam = currentTeams.find(t => t.id === awayId);

    // Sistema de validación de ascensos (solo Ligas)
    const isMax1 = isLeague && activeComp.teams && activeComp.matchday >= generateLeagueSchedule(activeComp.teams).length;
    const isMax2 = isLeague && activeComp.teams2 && activeComp.matchday2 >= generateLeagueSchedule(activeComp.teams2).length;
    const readyForPromotion = isLeague && isMax1 && isMax2 && !activeComp.showWinner && !activeComp.showWinner2;
    // La nueva temporada global sólo puede arrancar cuando TODAS las ligas
    // terminaron su calendario y la Champions ya se resolvió.
    const seasonReadyForNewSeason = allLeaguesFinished && championsFinished;
    const leagueTotal = isLeague ? divTotalRounds(currentTeams) : 0;
    const leagueDivDone = isLeague && leagueTotal > 0 && currentMatchday >= leagueTotal;
    const canPlayGlobalMatchday = isLeague ? (!leagueDivDone && currentMatchday < globalMatchday) : true;
    const leaguePendingNow = isLeague && leaguePendingAt(activeComp, globalMatchday);

    if (compView === 'config') return (
      <ConfigPanel 
        initialComp={activeComp} 
        compId={activeCompId} 
        onSave={(draftData) => { updateActiveComp(draftData); setCompView('main'); }}
        onCancel={() => setCompView('main')}
        onTotalReset={handleTotalReset}
      />
    );

    if (compView === 'main') return (
      <div className='flex-grow px-4 pb-20 relative'>

        {/* SAVE MODAL */}
        {/* SAVE MODAL */}
        <AnimatePresence>
          {showSaveModal && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className='fixed top-4 right-4 z-[80]'>
              <div className='bg-emerald-600/90 backdrop-blur-xl px-5 py-3 rounded-2xl border border-emerald-400/40 shadow-[0_0_30px_rgba(52,211,153,0.4)] flex items-center gap-3'>
                <div className='w-8 h-8 bg-emerald-500/30 rounded-full flex items-center justify-center'>
                  <Check size={16} className='text-white' />
                </div>
                <div>
                  <p className='text-[11px] font-black uppercase italic text-white'>¡Guardado!</p>
                  <p className='text-[8px] font-bold text-emerald-200 uppercase tracking-wider'>Progreso almacenado</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ELIMINATED MODAL - Switch team in cups (groups + knockout) */}
        <AnimatePresence>
          {eliminatedModal && activeComp && activeComp.type !== 'league' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md'>
              <motion.div initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} className='bg-slate-900/95 backdrop-blur-xl w-full max-w-sm rounded-[2.5rem] border border-red-500/30 shadow-2xl relative overflow-hidden max-h-[85vh] flex flex-col'>
                <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent' />
                <div className='p-6 text-center shrink-0'>
                  <AlertTriangle size={48} className='text-red-400 mx-auto mb-3 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]' />
                  <h2 className='text-xl font-black italic uppercase text-red-400 mb-2'>¡Eliminado!</h2>
                  <p className='text-[11px] font-bold text-slate-300'>Tu equipo fue eliminado en <span className='text-red-300 uppercase'>{eliminatedModal.phase}</span>.</p>
                  <p className='text-[10px] font-bold text-slate-400 mt-1'>Elige un nuevo equipo para continuar el torneo.</p>
                </div>
                <div className='overflow-y-auto flex-grow px-4 pb-4 custom-scrollbar'>
                  <div className='grid gap-2'>
                    {(() => {
                      // Get remaining teams based on current phase
                      const bracket = activeComp.bracket;
                      const nextPhase = activeComp.phase;
                      let remainingTeams: any[] = [];

                      if (bracket && bracket[nextPhase]) {
                        // Knockout: get teams from next round bracket
                        const nextMatches = Array.isArray(bracket[nextPhase]) ? bracket[nextPhase] : [bracket[nextPhase]];
                        const remainingIds = new Set<number>();
                        nextMatches.forEach((m: any) => { if (m?.hId) remainingIds.add(m.hId); if (m?.aId) remainingIds.add(m.aId); });
                        remainingTeams = activeComp.teams.filter((t: any) => remainingIds.has(t.id));
                      } else if (bracket) {
                        // After group stage: get all teams still in bracket (any phase)
                        const allIds = new Set<number>();
                        ['Octavos', 'Cuartos', 'Semis', 'Final'].forEach(p => {
                          const matches = bracket[p];
                          if (matches) {
                            const arr = Array.isArray(matches) ? matches : [matches];
                            arr.forEach((m: any) => { if (m?.hId) allIds.add(m.hId); if (m?.aId) allIds.add(m.aId); });
                          }
                        });
                        remainingTeams = activeComp.teams.filter((t: any) => allIds.has(t.id));
                      }

                      return remainingTeams.map((t: any) => (
                        <button key={t.id} onClick={() => {
                          updateActiveComp({ userTeamId: t.id });
                          setEliminatedModal(null);
                        }} className='flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-slate-800/40 hover:bg-blue-600/30 hover:border-blue-400/50 active:scale-95 transition-all backdrop-blur-md'>
                          <Shield color1={t.color1} color2={t.color2} initial={t.name} size='sm' isFlag={t.isFlag} />
                          <div className='text-left'>
                            <p className='text-[10px] font-black uppercase italic text-white'>{t.name}</p>
                            <p className='text-[8px] font-bold text-slate-300'>{t.att}/{t.opp}/{t.def}</p>
                          </div>
                        </button>
                      ));
                    })()}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RESET CONFIRM MODAL */}
        <AnimatePresence>
          {resetConfirmModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md'>
              <motion.div initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} className='bg-slate-900/95 backdrop-blur-xl w-full max-w-sm rounded-[2.5rem] border border-red-500/30 shadow-2xl relative overflow-hidden'>
                <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent' />
                <div className='p-8 text-center'>
                  <div className='w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(239,68,68,0.3)]'>
                    <RotateCcw size={36} className='text-red-400' />
                  </div>
                  <h2 className='text-xl font-black italic uppercase text-red-400 mb-3'>¿Reiniciar Temporada?</h2>
                  {isLeague ? (
                    <div className='space-y-2 mb-6'>
                      <p className='text-[11px] font-bold text-slate-300'>Se reiniciarán <span className='text-white'>ambas divisiones</span> de {activeComp.name}:</p>
                      <div className='flex gap-2 justify-center mt-3'>
                        <div className='bg-blue-900/30 border border-blue-500/20 px-3 py-2 rounded-xl'>
                          <p className='text-[9px] font-black text-blue-400 uppercase'>1ª División</p>
                          <p className='text-[8px] text-slate-400 font-bold'>Jornada {activeComp.matchday}</p>
                        </div>
                        <div className='bg-emerald-900/30 border border-emerald-500/20 px-3 py-2 rounded-xl'>
                          <p className='text-[9px] font-black text-emerald-400 uppercase'>2ª División</p>
                          <p className='text-[8px] text-slate-400 font-bold'>Jornada {activeComp.matchday2 || 0}</p>
                        </div>
                      </div>
                      <p className='text-[9px] font-bold text-red-400/80 mt-2'>⚠️ Todo el progreso, estadísticas y resultados se perderán.</p>
                    </div>
                  ) : (
                    <div className='mb-6'>
                      <p className='text-[11px] font-bold text-slate-300'>Se reiniciará todo el torneo de <span className='text-white'>{activeComp.name}</span>.</p>
                      <p className='text-[9px] font-bold text-red-400/80 mt-2'>⚠️ Equipos, grupos y resultados se restaurarán.</p>
                    </div>
                  )}
                  <div className='flex gap-3'>
                    <button onClick={() => setResetConfirmModal(false)} className='flex-1 bg-slate-800/80 border border-white/10 text-slate-200 py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest active:scale-95 transition-all'>Cancelar</button>
                    <button onClick={() => { handleTotalReset(activeCompId); setResetConfirmModal(false); }} className='flex-1 bg-gradient-to-r from-red-700/80 to-red-600/80 border-2 border-red-400/40 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest active:scale-95 transition-all shadow-[0_0_25px_rgba(239,68,68,0.35)] hover:shadow-[0_0_35px_rgba(239,68,68,0.5)] hover:border-red-300/60 flex items-center justify-center gap-2'>
                      <RotateCcw size={14} className='text-red-200'/> Reiniciar
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {showChampionsHistory && (
          <ChampionsHistoryModal
            championsHistory={(viewDiv === 2 ? activeComp?.championsHistory2 : activeComp?.championsHistory) || []}
            title={`Palmarés · ${activeComp?.name || 'Liga'} · ${viewDiv === 2 ? '2ª' : '1ª'} Div.`}
            compId={activeCompId}
            div={viewDiv === 2 ? 2 : 1}
            showTopWinners={activeComp?.type === 'league'}
            onClose={() => setShowChampionsHistory(false)}
          />
        )}

        {/* NEWS MODAL */}

        <AnimatePresence>
          {showNewsModal && (() => {
            const currentMd = isDiv2 ? (activeComp.matchday2 || 0) : (activeComp.matchday || 0);
            const currentTms = isDiv2 ? (activeComp.teams2 || []) : (activeComp.teams || []);
            const currentHist = isDiv2 ? (activeComp.history2 || []) : (activeComp.history || []);
            const currentSched = currentTms.length > 0 ? generateLeagueSchedule(currentTms) : [];
            const newsItems = generateNews(
              currentTms,
              activeComp.teams2 || [],
              currentMd,
              activeComp.type,
              activeComp.name,
              currentHist,
              currentSched,
              activeComp.phase
            );
            return (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-md' onClick={() => setShowNewsModal(false)}>
                <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} onClick={e => e.stopPropagation()} className='bg-slate-900/95 backdrop-blur-xl w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-amber-500/20 shadow-2xl relative overflow-hidden max-h-[85vh]'>
                  <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent' />
                  <div className='p-6'>
                    <div className='flex items-center justify-between mb-5'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 bg-amber-500/20 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)]'>
                          <Megaphone size={20} className='text-amber-400' />
                        </div>
                        <div>
                          <h2 className='text-lg font-black italic uppercase text-white drop-shadow-md'>Noticias</h2>
                          <p className='text-[8px] font-bold text-slate-400 uppercase tracking-widest'>Jornada {isDiv2 ? (activeComp.matchday2 || 0) : (activeComp.matchday || 0)} · {activeComp.name}</p>
                        </div>
                      </div>
                      <button onClick={() => setShowNewsModal(false)} className='p-2 bg-slate-800/80 rounded-xl border border-white/10 active:scale-95 transition-all'>
                        <X size={16} className='text-slate-400' />
                      </button>
                    </div>

                    <div className='space-y-3 overflow-y-auto max-h-[60vh] pr-1 custom-scrollbar'>
                      {newsItems.length === 0 ? (
                        <div className='text-center py-10'>
                          <Newspaper size={32} className='text-slate-600 mx-auto mb-3' />
                          <p className='text-[10px] font-bold text-slate-500 uppercase italic'>No hay noticias aún. ¡Juega algunas jornadas!</p>
                        </div>
                      ) : (
                        newsItems.map((news, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className='bg-black/40 backdrop-blur-md rounded-2xl p-4 border transition-all hover:border-opacity-60'
                            style={{ borderColor: news.team?.color1 || '#ffffff', borderWidth: '1px', borderLeftWidth: '3px' }}
                          >
                            <div className='flex items-start gap-3'>
                              <div className='mt-0.5 shrink-0'>
                                <NewsIcon type={news.type} />
                              </div>
                              <div className='flex-grow min-w-0'>
                                <h3 className='text-[11px] font-black italic text-white leading-snug mb-1 drop-shadow-sm'>{news.title}</h3>
                                <p className='text-[9px] font-bold text-slate-400 leading-relaxed'>{news.desc}</p>
                                {news.team && (
                                  <div className='flex items-center gap-2 mt-2'>
                                    <div className='w-3 h-3 rounded-full' style={{ background: `linear-gradient(135deg, ${news.team.color1}, ${news.team.color2})` }} />
                                    <span className='text-[8px] font-black text-slate-500 uppercase tracking-wider'>{news.team.name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>

                    <button onClick={() => setShowNewsModal(false)} className='w-full mt-4 bg-slate-800/80 border border-white/10 text-slate-200 py-3 rounded-2xl text-[10px] font-black uppercase italic tracking-widest active:scale-95 transition-all'>
                      Cerrar
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        <AnimatePresence>
          {(currentShowWinner || readyForPromotion) && compView === 'main' && (() => {
            const sorted1 = activeComp.teams ? [...activeComp.teams].sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga)) : [];
            const sorted2 = activeComp.teams2 ? [...activeComp.teams2].sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga)) : [];
            const champion1 = sorted1[0];
            const champion2 = sorted2[0];
            const displayTeams = championModalDiv === 2 ? sorted2 : sorted1;
            const displayHistory = championModalDiv === 2 ? (activeComp.history2 || []) : (activeComp.history || []);
            const displayAllTeams = championModalDiv === 2 ? (activeComp.teams2 || []) : (activeComp.teams || []);
            const relegated = sorted1.slice(-3);
            const promoted = sorted2.slice(0, 3);
            // Vista previa con la mecánica original de herencia de stats
            const newPromotedStats = relegated.map(t => ({ att: t.att, opp: t.opp, def: t.def }));
            const newRelegatedStats = [
              { att: 5, opp: 5, def: 3 },
              { att: 4, opp: 4, def: 4 },
              { att: 3, opp: 4, def: 3 }
            ];

            return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='fixed inset-0 z-[60] bg-slate-950/98 backdrop-blur-xl flex flex-col'>
              {/* Confetti removed */}

              {/* Header */}
               <div className='shrink-0 pt-3 pb-2 px-4'>
                <div className='flex items-center justify-center gap-3'>
                  <Trophy size={36} className='text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]' />
                  <div>
                    <h1 className='text-xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 drop-shadow-md'>¡CAMPEÓN!</h1>
                    <p className='text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]'>{activeComp.name}</p>
                  </div>
                </div>
              </div>

              {/* Winner showcase */}
              <div className='shrink-0 px-4 pb-3'>
                <div className='bg-gradient-to-br from-yellow-500/15 to-amber-600/10 border border-yellow-500/30 rounded-2xl p-3 shadow-[0_0_30px_rgba(234,179,8,0.1)]'>
                  <div className='flex items-center gap-3'>
                    <Shield color1={winner?.color1} color2={winner?.color2} initial={winner?.name} size='md' isFlag={winner?.isFlag} />
                    <div className='flex-1 min-w-0'>
                      <h2 className='text-base font-black uppercase italic text-white drop-shadow-md truncate'>{winner?.name}</h2>
                      <p className='text-[8px] font-bold text-yellow-400/80 uppercase tracking-widest'>
                        {isDiv2 ? '2ª División' : (isLeague ? '1ª División' : activeComp.name)}
                      </p>
                      {winner && (
                        <div className='flex gap-1.5 mt-1.5 flex-wrap'>
                          <span className='text-[9px] font-black bg-yellow-500/25 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-500/40'>{winner.pts} PTS</span>
                          <span className='text-[9px] font-bold bg-slate-800/70 text-slate-200 px-2 py-0.5 rounded-full border border-white/10'>{winner.w}G {winner.d}E {winner.l}P</span>
                          <span className='text-[9px] font-bold bg-slate-800/70 text-slate-200 px-2 py-0.5 rounded-full border border-white/10'>GF:{winner.gf} GC:{winner.ga}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className='flex mx-4 bg-slate-900/80 rounded-2xl border border-white/10 p-0.5 shrink-0'>
                {[
                  { key: 'stats', label: '📊 Clasificación' },
                  { key: 'results', label: '📋 Resultados' },
                  ...(!isLeague ? [{ key: 'bracket', label: '⚔️ Llaves' }] : []),
                  ...(isLeague ? [{ key: 'promotions', label: '↕️ Asc/Desc' }] : [])
                ].map(tab => (
                  <button key={tab.key} onClick={() => setChampionModalTab(tab.key as any)} className={`flex-1 py-2 text-[8px] font-black uppercase italic tracking-wider rounded-xl transition-all ${championModalTab === tab.key ? 'text-yellow-400 bg-yellow-500/15 shadow-inner' : 'text-slate-400 hover:text-white'}`}>{tab.label}</button>
                ))}
              </div>

              {/* Div switcher for leagues */}
              {isLeague && (
                <div className='flex mx-4 mt-2 bg-slate-800/60 p-0.5 rounded-xl border border-white/10 shrink-0'>
                  <button onClick={() => setChampionModalDiv(1)} className={`flex-1 py-1.5 text-[9px] font-black uppercase italic rounded-lg transition-all ${championModalDiv === 1 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>1ª División</button>
                  <button onClick={() => setChampionModalDiv(2)} className={`flex-1 py-1.5 text-[9px] font-black uppercase italic rounded-lg transition-all ${championModalDiv === 2 ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400'}`}>2ª División</button>
                </div>
              )}

              {/* Content area */}
              <div className='flex-grow overflow-y-auto px-4 py-4 custom-scrollbar'>
                {/* TAB: STATS */}
                {championModalTab === 'stats' && (
                  <div>
                    {isLeague ? (
                      <>
                        <h3 className='text-xs font-black uppercase text-slate-200 mb-3 text-center'>Clasificación</h3>
                        <div className='bg-slate-900/30 rounded-2xl border border-white/10 overflow-x-auto overflow-y-auto custom-scrollbar' style={{ maxHeight: '50vh' }}>
                          <table className='w-full text-left border-collapse'>
                            <thead className='bg-[#0f172a] sticky top-0 z-20'>
                              <tr className='text-[7px] font-black uppercase italic text-slate-400'>
                                <th className='px-1 py-1.5 sticky left-0 z-30 bg-[#0f172a] w-6'>#</th>
                                <th className='px-1 py-1.5 sticky left-[24px] z-30 bg-[#0f172a] min-w-[80px]'>Equipo</th>
                                <th className='px-1 py-1.5 text-center sticky left-[104px] z-30 bg-[#0f172a] border-r border-white/10 w-6'>PJ</th>
                                <th className='px-1 py-1.5 text-center w-5'>G</th><th className='px-1 py-1.5 text-center w-5'>E</th><th className='px-1 py-1.5 text-center w-5'>P</th>
                                <th className='px-1 py-1.5 text-center w-6'>GF</th><th className='px-1 py-1.5 text-center w-6'>GC</th><th className='px-1 py-1.5 text-center w-6'>DG</th>
                                <th className='px-1 py-1.5 text-center text-emerald-400 w-6'>Pts</th>
                              </tr>
                            </thead>
                            <tbody className='divide-y divide-white/5'>
                                {displayTeams.map((t, i) => {
                                  const isPromo = championModalDiv === 2 && i < 3;
                                  const isReleg = championModalDiv === 1 && i >= displayTeams.length - 3;
                                  const rowBg = i === 0 ? 'bg-yellow-500/15' : isPromo ? 'bg-emerald-900/20' : isReleg ? 'bg-red-900/20' : '';
                                  return (
                                    <tr key={t.id} className={rowBg}>
                                      <td className={'px-1 py-1.5 text-[9px] font-black italic sticky left-0 z-10 bg-[#0f172a] ' + (i === 0 ? 'text-yellow-400' : isPromo ? 'text-emerald-400' : isReleg ? 'text-red-400' : 'text-slate-300')}>{i+1}</td>
                                      <td className='px-1 py-1.5 sticky left-[24px] z-10 bg-[#0f172a] min-w-[80px]'>
                                        <div className='flex items-center gap-1'>
                                          <Shield color1={t.color1} color2={t.color2} initial={t.name} size='xs' isFlag={t.isFlag}/>
                                          <span className='text-[8px] font-bold uppercase truncate italic max-w-[60px]'>{t.name}</span>
                                        </div>
                                      </td>
                                      <td className='px-1 py-1.5 text-center text-[9px] font-bold sticky left-[104px] z-10 bg-[#0f172a] border-r border-white/10'>{t.p}</td>
                                      <td className='px-1 py-1.5 text-center text-[9px] font-bold'>{t.w}</td>
                                      <td className='px-1 py-1.5 text-center text-[9px] font-bold'>{t.d}</td>
                                      <td className='px-1 py-1.5 text-center text-[9px] font-bold'>{t.l}</td>
                                      <td className='px-1 py-1.5 text-center text-[9px] font-bold'>{t.gf}</td>
                                      <td className='px-1 py-1.5 text-center text-[9px] font-bold'>{t.ga}</td>
                                      <td className='px-1 py-1.5 text-center text-[9px] font-bold'>{t.gf - t.ga}</td>
                                      <td className='px-1 py-1.5 text-center text-[9px] font-black text-emerald-400'>{t.pts}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className='text-xs font-black uppercase text-slate-200 mb-3 text-center'>Clasificación por Grupo</h3>
                        <div className='space-y-4'>
                          {(activeComp.groups || []).map((group, gi) => {
                            const groupTeams = (activeComp.teams || []).filter(t => Array.isArray(group.teamIds) && group.teamIds.includes(t.id)).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));
                            return (
                              <div key={gi} className='bg-slate-900/30 rounded-2xl border border-white/10 overflow-hidden'>
                                <div className='bg-[#0f172a] p-2 border-b border-white/10'>
                                  <h4 className='text-[10px] font-black uppercase text-blue-400 flex items-center gap-1.5'><ShieldIcon size={10} /> {group.name}</h4>
                                </div>
                                <div className='overflow-x-auto custom-scrollbar'>
                                  <table className='w-full text-left border-collapse'>
                                    <thead className='bg-[#0f172a] sticky top-0 z-20'>
                                      <tr className='text-[7px] font-black uppercase italic text-slate-400'>
                                        <th className='px-1 py-1 sticky left-0 z-30 bg-[#0f172a] w-5'>#</th>
                                        <th className='px-1 py-1 sticky left-[20px] z-30 bg-[#0f172a] min-w-[70px]'>Equipo</th>
                                        <th className='px-1 py-1 text-center sticky left-[90px] z-30 bg-[#0f172a] border-r border-white/10 w-5'>PJ</th>
                                        <th className='px-1 py-1 text-center w-5'>G</th><th className='px-1 py-1 text-center w-5'>E</th><th className='px-1 py-1 text-center w-5'>P</th>
                                        <th className='px-1 py-1 text-center w-5'>GF</th><th className='px-1 py-1 text-center w-5'>GC</th><th className='px-1 py-1 text-center w-5'>DG</th>
                                        <th className='px-1 py-1 text-center text-emerald-400 w-5'>Pts</th>
                                      </tr>
                                    </thead>
                                    <tbody className='divide-y divide-white/5'>
                                      {groupTeams.map((t, i) => (
                                        <tr key={t.id} className={i < 2 ? 'bg-emerald-900/15' : ''}>
                                          <td className='px-1 py-1 text-[8px] font-black italic text-slate-300 sticky left-0 z-10 bg-[#0f172a]'>{i+1}</td>
                                          <td className='px-1 py-1 sticky left-[20px] z-10 bg-[#0f172a] min-w-[70px]'>
                                            <div className='flex items-center gap-1'>
                                              <Shield color1={t.color1} color2={t.color2} initial={t.name} size='xs' isFlag={t.isFlag}/>
                                              <span className='text-[8px] font-bold uppercase truncate italic max-w-[50px]'>{t.name}</span>
                                            </div>
                                          </td>
                                          <td className='px-1 py-1 text-center text-[8px] font-bold sticky left-[90px] z-10 bg-[#0f172a] border-r border-white/10'>{t.p}</td>
                                          <td className='px-1 py-1 text-center text-[8px] font-bold'>{t.w}</td>
                                          <td className='px-1 py-1 text-center text-[8px] font-bold'>{t.d}</td>
                                          <td className='px-1 py-1 text-center text-[8px] font-bold'>{t.l}</td>
                                          <td className='px-1 py-1 text-center text-[8px] font-bold'>{t.gf}</td>
                                          <td className='px-1 py-1 text-center text-[8px] font-bold'>{t.ga}</td>
                                          <td className='px-1 py-1 text-center text-[8px] font-bold'>{t.gf - t.ga}</td>
                                          <td className='px-1 py-1 text-center text-[8px] font-black text-emerald-400'>{t.pts}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* TAB: RESULTS */}
                {championModalTab === 'results' && (
                  <div>
                    <h3 className='text-xs font-black uppercase text-slate-200 mb-3 text-center'>Resultados</h3>
                    <div className='space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1'>
                      {displayHistory.length === 0 && <p className='text-center text-[10px] text-slate-400 italic py-8'>No hay resultados.</p>}
                      {displayHistory.map((h, i) => (
                        <div key={i} className='bg-black/20 rounded-xl p-2.5 border border-white/5'>
                          <h4 className='text-[8px] font-black uppercase text-blue-300 mb-1.5'>Jornada {h.day}</h4>
                          <div className='space-y-1'>
                            {Array.isArray(h.results) && h.results.map((r, ri) => {
                              const home = displayAllTeams.find(t => t.id === r.hId);
                              const away = displayAllTeams.find(t => t.id === r.aId);
                              return (
                                <div key={ri} className='flex items-center justify-between text-[8px] py-0.5'>
                                  <div className='flex items-center gap-1 w-20 truncate'>
                                    <Shield color1={home?.color1} color2={home?.color2} initial={home?.name} size='xs' isFlag={home?.isFlag}/>
                                    <span className='font-bold uppercase truncate'>{home?.name}</span>
                                  </div>
                                  <span className='font-black bg-slate-800/60 px-1.5 rounded tabular-nums'>{r.sh}-{r.sa}</span>
                                  <div className='flex items-center gap-1 w-20 justify-end truncate'>
                                    <span className='font-bold uppercase truncate'>{away?.name}</span>
                                    <Shield color1={away?.color1} color2={away?.color2} initial={away?.name} size='xs' isFlag={away?.isFlag}/>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {championModalTab === 'bracket' && !isLeague && activeComp.bracket && (
                  <div>
                    <h3 className='text-sm font-black uppercase text-slate-200 mb-4 text-center'>Eliminatorias</h3>
                    <div className='flex gap-6 overflow-x-auto custom-scrollbar pb-4'>
                      {['Octavos', 'Cuartos', 'Semis', 'Final'].filter(p => activeComp.bracket[p]).map(phase => (
                        <div key={phase} className='min-w-[240px] flex-shrink-0'>
                          <h4 className='text-[10px] font-black uppercase text-blue-300 mb-3 px-3 border-l-2 border-blue-500 bg-slate-900/40 rounded-r-xl py-1'>{phase}</h4>
                          <div className='grid grid-cols-1 gap-2.5'>
                            {(Array.isArray(activeComp.bracket[phase]) ? activeComp.bracket[phase] : [activeComp.bracket[phase]]).filter(m => m !== null).map((m, mi) => {
                              const h = activeComp.teams.find(t => t.id === m.hId);
                              const a = activeComp.teams.find(t => t.id === m.aId);
                              const isChampions = activeCompId === 'C1';
                              let bWinner = null;
                              if ((isChampions && phase !== 'Final' ? m.sh2 !== null : m.sh !== null)) {
                                if (isChampions && phase !== 'Final') {
                                  const totH = (m.sh || 0) + (m.sh2 || 0); const totA = (m.sa || 0) + (m.sa2 || 0);
                                  if (totH > totA) bWinner = h; else if (totA > totH) bWinner = a; else if (m.penH !== null && m.penH !== undefined) bWinner = m.penH > m.penA ? h : a;
                                } else {
                                  if (m.sh > m.sa) bWinner = h; else if (m.sa > m.sh) bWinner = a; else if (m.penH !== null && m.penH !== undefined) bWinner = m.penH > m.penA ? h : a;
                                }
                              }
                              return (
                                <div key={mi} className='bg-slate-900/40 rounded-xl p-2.5 border border-white/10 flex flex-col gap-1.5'>
                                  <div className='flex justify-between items-center'>
                                    <div className='flex items-center gap-1.5 flex-1 truncate'>
                                      <Shield color1={h?.color1} color2={h?.color2} initial={h?.name} size='xs' isFlag={h?.isFlag} />
                                      <span className={'text-[9px] font-bold uppercase italic truncate ' + (h ? '' : 'text-slate-500')}>{h?.name || 'TBD'}</span>
                                    </div>
                                    <div className='flex items-center gap-1 tabular-nums font-black italic text-[10px] bg-black/30 px-1.5 py-0.5 rounded'>
                                      {m.sh !== null && <span>{m.sh}</span>}{isChampions && m.sh2 !== null && <span className='text-slate-400 text-[8px]'>({m.sh2})</span>}{m.penH !== null && m.penH !== undefined && <span className='text-red-400 text-[8px] font-black'>[{m.penH}]</span>}
                                    </div>
                                  </div>
                                  <div className='flex justify-between items-center'>
                                    <div className='flex items-center gap-1.5 flex-1 truncate'>
                                      <Shield color1={a?.color1} color2={a?.color2} initial={a?.name} size='xs' isFlag={a?.isFlag} />
                                      <span className={'text-[9px] font-bold uppercase italic truncate ' + (a ? '' : 'text-slate-500')}>{a?.name || 'TBD'}</span>
                                    </div>
                                    <div className='flex items-center gap-1 tabular-nums font-black italic text-[10px] bg-black/30 px-1.5 py-0.5 rounded'>
                                      {m.sa !== null && <span>{m.sa}</span>}{isChampions && m.sa2 !== null && <span className='text-slate-400 text-[8px]'>({m.sa2})</span>}{m.penA !== null && m.penA !== undefined && <span className='text-red-400 text-[8px] font-black'>[{m.penA}]</span>}
                                    </div>
                                  </div>
                                  {bWinner && (
                                    <div className='mt-1 pt-1.5 border-t border-white/10 flex items-center justify-center gap-1.5 bg-emerald-900/30 rounded-b-lg py-1'>
                                      <span className='text-[7px] font-black uppercase text-emerald-300 italic'>Pasa:</span>
                                      <Shield color1={bWinner.color1} color2={bWinner.color2} initial={bWinner.name} size='xs' isFlag={bWinner.isFlag} />
                                      <span className='text-[8px] font-black uppercase italic truncate max-w-[80px]'>{bWinner.name}</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {championModalTab === 'promotions' && isLeague && (
                  <div className='space-y-4 text-left'>
                    <div className='bg-emerald-900/20 border border-emerald-500/20 p-3 rounded-2xl'>
                      <h4 className='text-[9px] font-black uppercase text-emerald-400 mb-2 flex items-center gap-1.5'><ArrowUpCircle size={13}/> Ascienden a 1ª</h4>
                      <div className='space-y-1.5'>
                        {promoted.map((t, i) => (
                          <div key={t.id} className='flex items-center gap-2 bg-black/30 p-2 rounded-xl border border-white/5'>
                            <span className='text-[9px] font-black text-emerald-300 w-3'>{i+1}</span>
                            <Shield color1={t.color1} color2={t.color2} initial={t.name} size='xs'/>
                            <span className='text-[9px] font-bold uppercase truncate flex-grow'>{t.name}</span>
                            <span className='text-[7px] font-bold text-slate-400'>{t.att}/{t.opp}/{t.def}</span>
                            <span className='text-[7px] text-emerald-400'>→</span>
                            <span className='text-[7px] font-black text-emerald-300'>{newPromotedStats[i]?.att}/{newPromotedStats[i]?.opp}/{newPromotedStats[i]?.def}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className='bg-red-900/20 border border-red-500/20 p-3 rounded-2xl'>
                      <h4 className='text-[9px] font-black uppercase text-red-400 mb-2 flex items-center gap-1.5'><ArrowDownCircle size={13}/> Descienden a 2ª</h4>
                      <div className='space-y-1.5'>
                        {relegated.map((t, i) => (
                          <div key={t.id} className='flex items-center gap-2 bg-black/30 p-2 rounded-xl border border-white/5'>
                            <span className='text-[9px] font-black text-red-300 w-3'>↓</span>
                            <Shield color1={t.color1} color2={t.color2} initial={t.name} size='xs'/>
                            <span className='text-[9px] font-bold uppercase truncate flex-grow'>{t.name}</span>
                            <span className='text-[7px] font-bold text-slate-400'>{t.att}/{t.opp}/{t.def}</span>
                            <span className='text-[7px] text-red-400'>→</span>
                            <span className='text-[7px] font-black text-red-300'>{newRelegatedStats[i]?.att}/{newRelegatedStats[i]?.opp}/{newRelegatedStats[i]?.def}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer buttons */}
              <div className='shrink-0 p-4 border-t border-white/10 bg-slate-950/80 space-y-2'>
                {isLeague && readyForPromotion && championModalTab !== 'promotions' ? (
                  <button onClick={() => setChampionModalTab('promotions')} className='w-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-4 rounded-2xl text-[11px] font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2'>
                    <ArrowUpCircle size={16}/> Ver Ascensos y Descensos
                  </button>
                ) : isLeague && readyForPromotion && championModalTab === 'promotions' ? (
                  seasonReadyForNewSeason ? (
                  <button onClick={() => {
                    setChampionModalTab('stats');
                    setChampionModalDiv(1);
                    startNewGlobalSeason();
                  }} className='w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 py-4 rounded-2xl text-[11px] font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2'>
                    <RotateCcw size={16}/> Nueva Temporada Global
                  </button>
                  ) : (
                  <div className='space-y-2'>
                    <p className='text-[9px] font-black uppercase italic text-amber-300 text-center leading-relaxed'>
                      {allLeaguesFinished ? '🏆 Resuelve la Champions League para iniciar la nueva temporada global' : '⏳ Otras ligas siguen en juego. La temporada global continúa'}
                    </p>
                    {allLeaguesFinished && !championsFinished && (
                      <button onClick={() => {
                        setChampionModalTab('stats');
                        setChampionModalDiv(1);
                        updateActiveComp({ showWinner: false, showWinner2: false });
                        setActiveCompId('C1');
                        setCompView('main');
                        setView('competition');
                      }} className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 border border-blue-400/40">
                        <Trophy size={15} className="text-yellow-300 animate-pulse" /> Ir a Champions League
                      </button>
                    )}
                    <button onClick={() => { setChampionModalTab('stats'); setChampionModalDiv(1); updateActiveComp({ showWinner: false, showWinner2: false }); }} className='w-full bg-slate-800/80 border border-white/10 text-slate-200 py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest active:scale-95 transition-all'>Cerrar</button>
                  </div>
                  )
                ) : !isLeague ? (
                  <div className='flex gap-2'>
                    <button onClick={() => {
                       setChampionModalTab('stats');
                       setChampionModalDiv(1);
                       updateActiveComp({ showWinner: false });
                    }} className='flex-1 bg-slate-800/80 border border-white/10 text-slate-200 py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest active:scale-95 transition-all'>Cerrar</button>
                    <button onClick={() => {
                       setChampionModalTab('stats');
                       setChampionModalDiv(1);
                       if (activeCompId === 'C1' && seasonReadyForNewSeason) {
                         startNewGlobalSeason();
                       } else {
                         handleTotalReset(activeCompId);
                         updateActiveComp({ showWinner: false });
                       }
                    }} className='flex-[2] bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2'>
                      <RotateCcw size={14}/> {activeCompId === 'C1' && seasonReadyForNewSeason ? 'Nueva Temporada Global' : 'Nueva Temporada'}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => {
                     setChampionModalTab('stats');
                     setChampionModalDiv(1);
                     if (isDiv2) updateActiveComp({ showWinner2: false }); else updateActiveComp({ showWinner: false });
                  }} className='w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 py-4 rounded-2xl text-[11px] font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all'>Continuar</button>
                )}
              </div>
            </motion.div>
            );
          })()}
        </AnimatePresence>

        <header className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-3'>
            <button onClick={() => setView('hub')} className='p-2 bg-slate-900/30 backdrop-blur-md rounded-xl text-slate-200 border border-white/10 active:scale-95 transition-all'><ChevronLeft /></button>
            <div>
              <h2 className='text-xl font-black italic uppercase truncate drop-shadow-md'>{activeComp?.name}</h2>
              {activeComp.type !== 'league' && <span className='text-[8px] font-black text-blue-300 uppercase tracking-widest drop-shadow-md'>Fase: {activeComp.phase}</span>}
            </div>
          </div>
          <button onClick={manualSave} className='p-2 bg-blue-600/30 text-blue-300 rounded-xl border border-blue-500/40 active:scale-95'><Save size={18}/></button>
        </header>

        {isLeague && (
          <div className='flex mb-6 bg-slate-900/40 p-1 rounded-2xl border border-white/10 backdrop-blur-md'>
            <button onClick={() => setViewDiv(1)} className={`flex-1 py-2.5 text-[10px] font-black uppercase italic rounded-[10px] transition-all ${!isDiv2 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>1ª División</button>
            <button onClick={() => setViewDiv(2)} className={`flex-1 py-2.5 text-[10px] font-black uppercase italic rounded-[10px] transition-all ${isDiv2 ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>2ª División</button>
          </div>
        )}

        <div className='mb-6 bg-slate-900/30 p-3 rounded-[2rem] border border-white/10 backdrop-blur-md shadow-lg space-y-2'>
           <div className={`grid gap-2 ${activeComp.type !== 'league' ? 'grid-cols-5' : 'grid-cols-4'}`}>
             <MenuButton icon={<BarChart3 size={18} className='text-emerald-400'/>} label="Stats" onClick={() => setCompView('stats')} />
             <MenuButton icon={<Calendar size={18} className='text-blue-400'/>} label="Fechas" onClick={() => setCompView('calendar')} />
             <MenuButton icon={<History size={18} className='text-yellow-400'/>} label="Result." onClick={() => setCompView('results')} />
             {activeComp.type !== 'league' && (
               <MenuButton icon={<Swords size={18} className='text-purple-400'/>} label="Llaves" onClick={() => setCompView('bracket')} />
             )}
             <MenuButton icon={<Users size={18} className='text-indigo-400'/>} label="Equipo" onClick={() => setCompView('teamSelect')} />
           </div>
           <div className='grid grid-cols-2 gap-2'>
             <MenuButton icon={<Newspaper size={16} className='text-amber-400'/>} label="Noticias" onClick={() => setShowNewsModal(true)} isWide />
             <MenuButton icon={<Settings size={16} className='text-slate-300'/>} label="Ajustes" onClick={() => setCompView('config')} isWide />
           </div>
        </div>

        {activeComp.type !== 'league' && activeComp.phase === 'groups' && Array.isArray(activeComp.groups) && (
          <div className='grid grid-cols-1 gap-6 mb-8'>
            {activeComp.groups.map((group, gi) => (
              <section key={gi} className='bg-slate-900/30 backdrop-blur-md rounded-[2rem] p-4 border border-white/10 shadow-lg'>
                <h3 className='text-[10px] font-black uppercase text-blue-400 mb-3 flex items-center gap-2 drop-shadow-md'><ShieldIcon size={12} /> {group?.name}</h3>
                <div className='space-y-1.5'>
                  {activeComp.teams.filter(t => group.teamIds.includes(t.id)).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga)).map((t, i) => (
                    <div key={t.id} className={'flex items-center gap-3 p-2 rounded-xl ' + (t.id === activeComp.userTeamId ? 'bg-blue-600/40 border border-blue-400/50 shadow-inner' : 'bg-black/30')}>
                      <span className='text-[10px] font-black text-slate-300 italic w-4'>{i+1}</span>
                      <Shield color1={t.color1} color2={t.color2} initial={t.name} size='sm' isFlag={t.isFlag} />
                      <span className='text-[11px] font-bold uppercase truncate flex-grow italic text-white drop-shadow-sm'>{t.name}</span>
                      <span className='text-[10px] font-black bg-slate-800/60 px-2 py-0.5 rounded-md text-emerald-400 border border-white/10'>{t.pts} PTS</span>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {isLeague && (
          <section className='bg-slate-900/40 backdrop-blur-md rounded-[2rem] p-4 border border-white/10 mb-6 shadow-lg'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-[8px] font-black uppercase tracking-widest text-emerald-400'>🌎 Temporada {seasonState.season} · Jornada Global {globalMatchday}</p>
                <p className='text-sm font-black uppercase italic text-white mt-1'>{leagueProgressLabel(activeComp, globalMatchday)}</p>
                <p className='text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-0.5'>
                  {leagueDivDone ? `${isDiv2 ? '2ª' : '1ª'} División finalizada` : `${isDiv2 ? '2ª' : '1ª'} División: Jornada ${Math.min(currentMatchday + 1, leagueTotal || 1)}/${leagueTotal}`}
                </p>
              </div>
              {leaguePendingNow && (
                <button onClick={() => simulateLeagueToGlobal(activeCompId)} className='bg-amber-500/90 text-slate-950 px-4 py-3 rounded-2xl text-[9px] font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-1.5'>
                  <Dices size={14}/> Simular
                </button>
              )}
            </div>
            {!leaguePendingNow && !allLeaguesFinished && (
              <p className='mt-3 text-[8px] font-bold uppercase tracking-wider text-emerald-400'>
                {pendingLeagueIds.length === 0
                  ? `✔️ Jornada global ${globalMatchday - 1} completada en todas las ligas · Siguiente jornada ${globalMatchday}`
                  : `✔️ Jornada global ${globalMatchday} resuelta en esta liga · sincronizando el resto...`}
              </p>
            )}

          </section>
        )}

        {isLeague && (
          <section className='bg-slate-900/30 backdrop-blur-md rounded-[2rem] p-4 border border-white/10 mb-6 shadow-lg'>
            <div className='grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 mb-3'>
              <h3 className='truncate text-[10px] font-black uppercase text-slate-200 flex items-center gap-2 drop-shadow-md'><BarChart3 size={12} /> Top Clasificación {isDiv2 ? '2ª' : '1ª'} Div.</h3>
              <button onClick={() => setShowChampionsHistory(true)} className='shrink-0 flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-500/15 px-2.5 py-1.5 text-[8px] font-black uppercase tracking-widest text-amber-300 active:scale-95'>
                <Trophy size={11}/> Palmarés
              </button>
            </div>

            <div className='space-y-1.5'>
              {sortedTeams.slice(0, 6).map((t, i) => (
                <div key={t.id} className={'flex items-center gap-3 p-2 rounded-xl ' + (t.id === activeComp.userTeamId ? 'bg-blue-600/40 border border-blue-400/50 shadow-inner' : (isDiv2 && i < 3 ? 'bg-emerald-900/30 border border-emerald-500/20' : 'bg-black/30'))}>
                  <span className={'text-[10px] font-black italic w-4 ' + (isDiv2 && i < 3 ? 'text-emerald-400' : 'text-slate-300')}>{i+1}</span>
                  <Shield color1={t?.color1} color2={t?.color2} initial={t?.name} size='sm' isFlag={t?.isFlag} />
                  <span className='text-[11px] font-bold uppercase truncate flex-grow italic text-white drop-shadow-sm'>{t?.name}</span>
                  <span className='text-[10px] font-black bg-slate-800/60 px-2 py-0.5 rounded-md text-emerald-400 border border-white/10'>{t.pts} PTS</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {!currentShowWinner && (currentMatch || (isLeague && currentMatchday >= generateLeagueSchedule(currentTeams).length)) && (
          <section className='bg-gradient-to-br from-blue-700/80 to-indigo-900/80 backdrop-blur-md rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden border border-white/20'>
            <div className='flex justify-between items-start mb-6'>
              <div className='flex flex-col items-center w-24'>
                <Shield color1={homeTeam?.color1} color2={homeTeam?.color2} initial={homeTeam?.name} size='lg' isFlag={homeTeam?.isFlag} />
                <p className='mt-2 text-[10px] font-black uppercase italic text-center truncate w-full text-white drop-shadow-sm'>{homeTeam?.name}</p>
                <div className='h-4 mt-1 flex items-start justify-center w-full'>
                  {homeTeam?.id === userTeam?.id && <span className='text-[7px] font-black bg-white/30 px-1.5 py-0.5 rounded uppercase backdrop-blur-sm text-white'>Tu Equipo</span>}
                </div>
              </div>
              <div className='flex flex-col items-center mt-4'>
                <span className='text-xs font-black text-white/70 italic mb-1 drop-shadow-sm'>VS</span>
                <div className='w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center animate-pulse border border-white/30 shadow-inner'><Play size={20} className='ml-1 text-white' /></div>
              </div>
              <div className='flex flex-col items-center w-24'>
                <Shield color1={awayTeam?.color1} color2={awayTeam?.color2} initial={awayTeam?.name} size='lg' isFlag={awayTeam?.isFlag} />
                <p className='mt-2 text-[10px] font-black uppercase italic text-center truncate w-full text-white drop-shadow-sm'>{awayTeam?.name}</p>
                <div className='h-4 mt-1 flex items-start justify-center w-full'>
                  {awayTeam?.id === userTeam?.id && <span className='text-[7px] font-black bg-white/30 px-1.5 py-0.5 rounded uppercase backdrop-blur-sm text-white'>Tu Equipo</span>}
                </div>
              </div>
            </div>

            {(() => {
              const schedule = generateLeagueSchedule(currentTeams);
              const isDone = currentMatchday >= schedule.length;
              if (isLeague && isDone) {
                 return (
                   <button disabled className='w-full bg-slate-800 text-slate-400 py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-widest shadow-inner border border-white/10'>
                     Temporada Finalizada
                   </button>
                 );
              }
              if (isLeague && !canPlayGlobalMatchday) {
                 return (
                   <button disabled className='w-full bg-slate-800 text-slate-400 py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-widest shadow-inner border border-white/10'>
                     Esperando Jornada Global {globalMatchday + 1}
                   </button>
                 );
              }
              return (
                <div className='space-y-2'>
                <button onClick={() => startMatch(homeId, awayId, isDiv2)} className='w-full bg-white/95 text-blue-900 py-4 rounded-2xl text-xs font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all flex flex-col items-center justify-center'>
                  <span>{activeComp.phase === 'Final' ? 'Gran Final' : ('Jugar ' + (isLeague || activeComp.phase === 'groups' ? 'Jornada ' + (currentMatchday + 1) : activeComp.phase + (activeCompId === 'C1' ? (activeComp.matchday % 2 === 0 ? ' (Ida)' : ' (Vuelta)') : '')))}</span>
                  <span className='text-[7px] opacity-60 mt-0.5 tracking-normal'>{homeTeam?.opp} vs {awayTeam?.opp} TIROS DISPONIBLES</span>

                </button>
                {isLeague && leaguePendingNow && (
                  <button onClick={() => simulateLeagueToGlobal(activeCompId)} className='w-full bg-slate-900/60 border border-white/15 text-slate-100 py-3 rounded-2xl text-[10px] font-black uppercase italic tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2'>
                    <Dices size={14}/> Simular Jornada {currentMatchday + 1}
                  </button>
                )}
                {!isLeague && (
                  <div className='grid grid-cols-2 gap-2'>
                    <button
                      onClick={() => processCupRound(null)}
                      disabled={cupAutoSim}
                      className='bg-slate-900/60 border border-white/15 text-slate-100 py-3 rounded-2xl text-[9px] font-black uppercase italic tracking-widest active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40'
                    >
                      <Dices size={14}/> Simular {activeComp.phase === 'groups' ? 'Jornada' : 'Ronda'}
                    </button>
                    <button
                      onClick={() => setCupAutoSim(v => !v)}
                      className={'py-3 rounded-2xl text-[9px] font-black uppercase italic tracking-widest active:scale-95 transition-all flex items-center justify-center gap-1.5 border ' + (cupAutoSim ? 'bg-red-600/80 border-red-300/40 text-white' : 'bg-amber-500/90 border-amber-300/40 text-slate-950')}
                    >
                      {cupAutoSim ? (<><X size={14}/> Detener</>) : (<><Wand2 size={14}/> Simular Todo</>)}
                    </button>
                  </div>
                )}
                </div>
              );
            })()}

          </section>
        )}
      </div>
    );

    if (compView === 'stats') return (
      <div className='flex-grow px-4 pb-20'>
        <div className='flex items-center gap-3 mb-6'>
          <button onClick={() => setCompView('main')} className='p-2 bg-slate-900/30 backdrop-blur-md rounded-xl active:scale-95 transition-all border border-white/10'><ChevronLeft /></button>
          <h2 className='text-xl font-black italic uppercase drop-shadow-md'>Estadísticas {isDiv2 && '(2ª Div)'}</h2>
        </div>

        {isLeague && (() => {
          const prev = isDiv2 ? activeComp.previousStandings2 : activeComp.previousStandings;
          const showingPrev = standingsView === 'previous';
          return (
            <>
              <div className='flex gap-2 bg-slate-900/40 p-1 rounded-2xl border border-white/10 mb-4'>
                <button onClick={() => setStandingsView('current')} className={`flex-1 py-2 text-[9px] font-black uppercase italic rounded-xl transition-all ${!showingPrev ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>Clasificación actual</button>
                <button onClick={() => setStandingsView('previous')} className={`flex-1 py-2 text-[9px] font-black uppercase italic rounded-xl transition-all ${showingPrev ? 'bg-yellow-500 text-slate-900 shadow-md' : 'text-slate-400'}`}>Anterior competición</button>
              </div>
              {showingPrev && (!prev || prev.length === 0) && (
                <div className='bg-slate-900/30 border border-white/10 rounded-[2rem] p-8 text-center text-[10px] font-bold uppercase italic text-slate-400'>No hay una competición anterior disponible.</div>
              )}
            </>
          );
        })()}

        {isLeague ? (
          (standingsView === 'previous' && !((isDiv2 ? activeComp.previousStandings2 : activeComp.previousStandings) || []).length) ? null :
          <div className='bg-slate-900/30 backdrop-blur-md rounded-[2rem] border border-white/10 overflow-x-auto custom-scrollbar relative shadow-xl'>

            <table className='w-full text-left border-collapse min-w-[680px]'>
              <thead className='bg-[#0f172a] sticky top-0 z-50 shadow-md'>
                <tr className='text-[8px] font-black uppercase italic text-slate-400'>
                  <th className='p-3 sticky z-50 bg-[#0f172a]' style={{ left: 0, minWidth: '40px' }}>Pos</th>
                  <th className='p-3 sticky z-50 bg-[#0f172a]' style={{ left: '40px', minWidth: '130px' }}>Equipo</th>
                  <th className='p-3 sticky z-50 bg-[#0f172a] text-center border-r border-white/10' style={{ left: '170px', minWidth: '40px' }}>PJ</th>
                  <th className='p-3 text-center'>G</th><th className='p-3 text-center'>E</th><th className='p-3 text-center'>P</th><th className='p-3 text-center'>GF</th><th className='p-3 text-center'>GC</th><th className='p-3 text-center'>DG</th><th className='p-3 text-center text-emerald-400'>Pts</th><th className='p-3 text-center' style={{ minWidth: '120px' }}>Últ. 5</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-white/5'>
                {(() => {
                  const prevTable = (isDiv2 ? activeComp.previousStandings2 : activeComp.previousStandings) || [];
                  const rows = standingsView === 'previous' ? prevTable : sortedTeams;
                  return Array.isArray(rows) && rows.map((t, i) => {
                  const isUser = standingsView !== 'previous' && t.id === activeComp.userTeamId;
                  const isPromo = standingsView !== 'previous' && isDiv2 && i < 3;
                  const isRelegation = standingsView !== 'previous' && !isDiv2 && i >= rows.length - 3;
                  const rowBg = isUser ? 'bg-blue-600/30' : (isPromo ? 'bg-emerald-900/20' : (isRelegation ? 'bg-red-900/20' : ''));

                  return (
                    <tr key={t.id} className={rowBg}>
                      <td className={'p-3 text-[10px] font-black italic sticky z-40 bg-[#0f172a] ' + (isPromo ? 'text-emerald-400' : isRelegation ? 'text-red-400' : 'text-slate-300')} style={{ left: 0 }}>{i+1}</td>
                      <td className='p-3 flex items-center gap-2 sticky z-40 bg-[#0f172a]' style={{ left: '40px', minWidth: '130px' }}><Shield color1={t?.color1} color2={t?.color2} initial={t?.name} size='xs' isFlag={t?.isFlag} /><span className='text-[10px] font-bold uppercase truncate italic max-w-[80px]'>{t?.name}</span></td>
                      <td className='p-3 text-center text-[10px] font-bold sticky z-40 bg-[#0f172a] border-r border-white/10' style={{ left: '170px' }}>{t.p}</td>
                      <td className='p-3 text-center text-[10px] font-bold'>{t.w}</td><td className='p-3 text-center text-[10px] font-bold'>{t.d}</td><td className='p-3 text-center text-[10px] font-bold'>{t.l}</td><td className='p-3 text-center text-[10px] font-bold'>{t.gf}</td><td className='p-3 text-center text-[10px] font-bold'>{t.ga}</td><td className='p-3 text-center text-[10px] font-bold'>{t.gf - t.ga}</td><td className='p-3 text-center text-[10px] font-black text-emerald-400'>{t.pts}</td><td className='p-3'><FormBadges form={standingsView === 'previous' ? [] : getLast5(t.id, currentHistory)} /></td>
                    </tr>
                  )
                });
                })()}

              </tbody>
            </table>
          </div>
        ) : (
          <div className='space-y-8'>
            {/* Lógica original de Copas y Eliminatorias */}
            {(activeComp.groups || []).map((group, gi) => (
              <div key={gi} className='bg-slate-900/30 backdrop-blur-md rounded-[2rem] border border-white/10 overflow-x-auto custom-scrollbar relative shadow-xl'>
                <div className='bg-[#0f172a] p-3 border-b border-white/10 sticky left-0 z-50'><h3 className='text-[10px] font-black uppercase text-blue-400 flex items-center gap-2'><ShieldIcon size={12} /> {group.name}</h3></div>
                <table className='w-full text-left border-collapse min-w-[680px]'>
                  <thead className='bg-[#0f172a] sticky top-0 z-50'>
                    <tr className='text-[8px] font-black uppercase italic text-slate-400'>
                      <th className='p-3 sticky z-50 bg-[#0f172a]' style={{ left: 0, minWidth: '40px' }}>Pos</th>
                      <th className='p-3 sticky z-50 bg-[#0f172a]' style={{ left: '40px', minWidth: '130px' }}>Equipo</th>
                      <th className='p-3 sticky z-50 bg-[#0f172a] text-center border-r border-white/10' style={{ left: '170px', minWidth: '40px' }}>PJ</th>
                      <th className='p-3 text-center'>G</th><th className='p-3 text-center'>E</th><th className='p-3 text-center'>P</th><th className='p-3 text-center'>GF</th><th className='p-3 text-center'>GC</th><th className='p-3 text-center'>DG</th><th className='p-3 text-center text-emerald-400'>Pts</th><th className='p-3 text-center' style={{ minWidth: '120px' }}>Últ. 5</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-white/5'>
                    {Array.isArray(activeComp.teams) && activeComp.teams.filter(t => Array.isArray(group.teamIds) && group.teamIds.includes(t.id)).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga)).map((t, i) => (
                      <tr key={t.id} className={t.id === activeComp.userTeamId ? 'bg-blue-600/30' : ''}>
                        <td className='p-3 text-[10px] font-black italic text-slate-300 sticky z-40 bg-[#0f172a]' style={{ left: 0 }}>{i+1}</td>
                        <td className='p-3 flex items-center gap-2 sticky z-40 bg-[#0f172a]' style={{ left: '40px', minWidth: '130px' }}><Shield color1={t?.color1} color2={t?.color2} initial={t?.name} size='xs' isFlag={t?.isFlag} /><span className='text-[10px] font-bold uppercase truncate italic max-w-[80px]'>{t?.name}</span></td>
                        <td className='p-3 text-center text-[10px] font-bold sticky z-40 bg-[#0f172a] border-r border-white/10' style={{ left: '170px' }}>{t.p}</td>
                        <td className='p-3 text-center text-[10px] font-bold'>{t.w}</td><td className='p-3 text-center text-[10px] font-bold'>{t.d}</td><td className='p-3 text-center text-[10px] font-bold'>{t.l}</td><td className='p-3 text-center text-[10px] font-bold'>{t.gf}</td><td className='p-3 text-center text-[10px] font-bold'>{t.ga}</td><td className='p-3 text-center text-[10px] font-bold'>{t.gf - t.ga}</td><td className='p-3 text-center text-[10px] font-black text-emerald-400'>{t.pts}</td><td className='p-3'><FormBadges form={getLast5(t.id, currentHistory)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    );

    if (compView === 'results') return (
      <div className='flex-grow px-4 pb-20'>
        <div className='flex items-center gap-3 mb-6'>
          <button onClick={() => setCompView('main')} className='p-2 bg-slate-900/30 backdrop-blur-md rounded-xl active:scale-95 transition-all border border-white/10'><ChevronLeft /></button>
          <h2 className='text-xl font-black italic uppercase drop-shadow-md'>Resultados {isDiv2 && '(2ª)'}</h2>
        </div>
        <div className='space-y-4'>
          {(!Array.isArray(currentHistory) || currentHistory.length === 0) && <div className='text-center py-20 text-slate-300 bg-slate-900/30 backdrop-blur-md rounded-[2rem] border border-white/5 italic font-bold uppercase text-[10px] shadow-lg'>No hay partidos jugados aún.</div>}
          {Array.isArray(currentHistory) && currentHistory.map((h, i) => (
            <div key={i} className='bg-slate-900/30 backdrop-blur-md rounded-3xl p-4 border border-white/10 shadow-lg'>
              <h3 className='text-[9px] font-black uppercase text-blue-300 mb-3 drop-shadow-md'>Jornada {h.day}</h3>
              <div className='space-y-2'>
                {Array.isArray(h.results) && h.results.map((r, ri) => {
                  const home = Array.isArray(currentTeams) ? currentTeams.find(t => t.id === r.hId) : null;
                  const away = Array.isArray(currentTeams) ? currentTeams.find(t => t.id === r.aId) : null;
                  return (
                    <div key={ri} className='flex items-center justify-between bg-black/30 p-3 rounded-2xl border border-white/5'>
                      <div className='flex items-center gap-2 w-24'><Shield color1={home?.color1} color2={home?.color2} initial={home?.name} size='xs' isFlag={home?.isFlag} /><span className='text-[9px] font-bold uppercase truncate italic'>{home?.name}</span></div>
                      <div className='bg-slate-800/60 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-black italic tabular-nums flex flex-col items-center border border-white/10'>
                        <span>{r.sh} - {r.sa}</span>
                        {r.penH !== undefined && r.penA !== undefined && <span className='text-[7px] text-blue-300 mt-0.5'>(pen {r.penH}-{r.penA})</span>}
                      </div>
                      <div className='flex items-center gap-2 w-24 justify-end'><span className='text-[9px] font-bold uppercase truncate italic'>{away?.name}</span><Shield color1={away?.color1} color2={away?.color2} initial={away?.name} size='xs' isFlag={away?.isFlag} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );

        if (compView === 'calendar') return (
      <div className='flex-grow px-4 pb-20'>
        <div className='flex items-center gap-3 mb-6'>
          <button onClick={() => setCompView('main')} className='p-2 bg-slate-900/30 backdrop-blur-md rounded-xl active:scale-95 transition-all border border-white/10'><ChevronLeft /></button>
          <h2 className='text-xl font-black italic uppercase drop-shadow-md'>Calendario {isDiv2 && '(2ª)'}</h2>
        </div>
        <div className='space-y-4'>
          {isLeague ? (
            (() => {
              const rounds = generateLeagueSchedule(currentTeams).map((round, ri) => ({ round, ri }));
              return [...rounds.filter(r => r.ri === currentMatchday), ...rounds.filter(r => r.ri > currentMatchday), ...rounds.filter(r => r.ri < currentMatchday).reverse()];
            })().map(({ round, ri }) => (
              <div key={ri} className={'bg-slate-900/30 backdrop-blur-md rounded-3xl p-4 border border-white/10 shadow-lg ' + (ri === currentMatchday ? 'ring-2 ring-blue-500/50' : 'opacity-80')}>
                <div className='flex justify-between items-center mb-3'>
                  <h3 className='text-[9px] font-black uppercase text-slate-300'>Jornada {ri + 1} {ri === currentMatchday && '(Actual)'}</h3>
                  <span className={'text-[7px] font-black uppercase px-2 py-0.5 rounded-full ' + (ri < currentMatchday ? 'bg-emerald-500/30 text-emerald-300' : ri === currentMatchday ? 'bg-blue-500/40 text-blue-200' : 'bg-slate-800/80 text-slate-300')}>{ri < currentMatchday ? 'Finalizado' : ri === currentMatchday ? 'En Curso' : 'Próximo'}</span>
                </div>
                <div className='space-y-2'>
                  {round.map((m, mi) => {
                    const home = currentTeams.find(t => t.id === m.homeId); const away = currentTeams.find(t => t.id === m.awayId);
                    const result = currentHistory.find(h => h.day === (ri + 1))?.results.find(r => (r.hId === m.homeId && r.aId === m.awayId) || (r.hId === m.awayId && r.aId === m.homeId));
                    return (
                      <div key={mi} className='flex items-center justify-between bg-black/30 p-2 rounded-xl border border-white/5'>
                        <div className='flex items-center gap-2 w-24'><Shield color1={home?.color1} color2={home?.color2} initial={home?.name} size='xs' isFlag={home?.isFlag} /><span className='text-[9px] font-bold uppercase truncate italic'>{home?.name}</span></div>
                        <div className='flex flex-col items-center'>{result ? <span className='text-[10px] font-black tabular-nums bg-slate-800/60 px-2 py-0.5 rounded'>{result.sh} - {result.sa}</span> : <span className='text-[8px] font-black text-slate-400 italic'>VS</span>}</div>
                        <div className='flex items-center gap-2 w-24 justify-end'><span className='text-[9px] font-bold uppercase truncate italic'>{away?.name}</span><Shield color1={away?.color1} color2={away?.color2} initial={away?.name} size='xs' isFlag={away?.isFlag} /></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            // Lógica intacta para torneos
            <div className='space-y-8'>
              {(activeComp.groups || []).length > 0 && (
                <div className='space-y-6'>
                  <h2 className='text-xs font-black uppercase text-slate-200 border-b border-white/20 pb-2 drop-shadow-md'>Fase de Grupos</h2>
                  {(activeComp.groups || []).map((group, gi) => {
                    const groupTeams = activeComp.teams.filter(t => group.teamIds.includes(t.id));
                    const isWorldCup = activeCompId === 'C2';
                    const groupSchedule = generateLeagueSchedule(groupTeams, !isWorldCup);
                    const maxMatchdays = isWorldCup ? 3 : 6;
                    return (
                      <div key={gi} className='bg-slate-900/30 backdrop-blur-md rounded-3xl p-4 border border-white/10 shadow-lg'>
                        <h3 className='text-[10px] font-black uppercase text-blue-400 mb-4 flex items-center gap-2 drop-shadow-md'><ShieldIcon size={12} /> {group.name}</h3>
                        <div className='space-y-4'>
                          {(() => {
                            const rounds = groupSchedule.map((round, ri) => ({ round, ri }));
                            const curIdx = activeComp.matchday % maxMatchdays;
                            if (activeComp.phase !== 'groups') return [...rounds].reverse();
                            return [...rounds.filter(r => r.ri === curIdx), ...rounds.filter(r => r.ri > curIdx), ...rounds.filter(r => r.ri < curIdx).reverse()];
                          })().map(({ round, ri }) => {
                            const isCur = activeComp.phase === 'groups' && ri === (activeComp.matchday % maxMatchdays);
                            const isPast = activeComp.phase !== 'groups' || (activeComp.phase === 'groups' && ri < (activeComp.matchday % maxMatchdays));

                            return (
                              <div key={ri} className={'p-3 rounded-2xl bg-black/30 border border-white/5 ' + (isCur ? 'border-blue-400/40 shadow-inner' : 'opacity-80')}>
                                <div className='flex justify-between items-center mb-2'>
                                  <span className='text-[8px] font-black uppercase text-slate-300 italic'>Jornada {ri + 1}</span>
                                  <span className={'text-[7px] font-black uppercase px-2 py-0.5 rounded-full ' + (isPast ? 'bg-emerald-500/30 text-emerald-300' : isCur ? 'bg-blue-500/40 text-blue-200' : 'bg-slate-800/80 text-slate-300')}>{isPast ? 'Finalizado' : isCur ? 'En Curso' : 'Próximo'}</span>
                                </div>
                                {round.map((m, mi) => {
                                  const home = activeComp.teams.find(t => t.id === m.homeId); const away = activeComp.teams.find(t => t.id === m.awayId);
                                  const result = activeComp.history.find(h => h.day === 'Jornada ' + (ri + 1))?.results.find(r => (r.hId === m.homeId && r.aId === m.awayId) || (r.hId === m.awayId && r.aId === m.homeId));

                                  return (
                                    <div key={mi} className='flex items-center justify-between py-1 border-b border-white/10 last:border-0'>
                                      <div className='flex items-center gap-2 w-20'><Shield color1={home?.color1} color2={home?.color2} initial={home?.name} size='xs' isFlag={home?.isFlag} /><span className='text-[9px] font-bold uppercase italic truncate'>{home?.name}</span></div>
                                      <div className='flex flex-col items-center'>
                                        {result ? (
                                          <div className='flex flex-col items-center'>
                                            <span className='text-[10px] font-black tabular-nums bg-slate-800/60 px-1.5 rounded'>{result.sh} - {result.sa}</span>
                                            {result.penH !== undefined && <span className='text-[7px] text-blue-300 font-bold'>(pen {result.penH}-{result.penA})</span>}
                                          </div>
                                        ) : <span className='text-[8px] font-black text-slate-400 italic'>VS</span>}
                                      </div>
                                      <div className='flex items-center gap-2 w-20 justify-end'><span className='text-[9px] font-bold uppercase italic truncate text-right'>{away?.name}</span><Shield color1={away?.color1} color2={away?.color2} initial={away?.name} size='xs' isFlag={away?.isFlag} /></div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeComp.bracket && (
                <div className='space-y-6'>
                  <h2 className='text-xs font-black uppercase text-slate-200 border-b border-white/20 pb-2 drop-shadow-md'>Eliminatorias</h2>
                  {(() => {
                    const po = ['Octavos', 'Cuartos', 'Semis', 'Final'];
                    const curIdx = po.indexOf(activeComp.phase);
                    if (curIdx === -1) return po; 
                    return [...po.slice(curIdx, curIdx + 1), ...po.slice(curIdx + 1), ...po.slice(0, curIdx).reverse()];
                  })().map(phase => {
                    const matches = activeComp.bracket[phase];
                    if (!matches || (Array.isArray(matches) && matches.length === 0)) return null;
                    const matchArray = Array.isArray(matches) ? matches : [matches];
                    const phases = ['groups', 'Octavos', 'Cuartos', 'Semis', 'Final'];
                    const currentPhaseIdx = phases.indexOf(activeComp.phase);
                    const phaseIdx = phases.indexOf(phase);
                    let status = phaseIdx < currentPhaseIdx ? 'Finalizado' : phaseIdx === currentPhaseIdx ? 'En Curso' : 'Próximo';

                    return (
                      <div key={phase} className={'bg-slate-900/30 backdrop-blur-md rounded-3xl p-4 border border-white/10 shadow-lg ' + (status === 'En Curso' ? 'ring-2 ring-blue-500/50' : 'opacity-80')}>
                        <div className='flex justify-between items-center mb-3'>
                          <h3 className='text-[9px] font-black uppercase text-slate-300'>{phase}</h3>
                          <span className={'text-[7px] font-black uppercase px-2 py-0.5 rounded-full ' + (status === 'Finalizado' ? 'bg-emerald-500/30 text-emerald-300' : status === 'En Curso' ? 'bg-blue-500/40 text-blue-200' : 'bg-slate-800/80 text-slate-300')}>{status}</span>
                        </div>
                        <div className='space-y-2'>
                          {matchArray.map((m, mi) => {
                            if (!m) return null;
                            const home = activeComp.teams.find(t => t.id === m.hId); const away = activeComp.teams.find(t => t.id === m.aId);
                            const isChampions = activeCompId === 'C1';
                            const isPlayedIda = m.sh !== null; const isPlayedVuelta = m.sh2 !== null;

                            return (
                              <div key={mi} className='flex flex-col bg-black/30 p-3 rounded-2xl gap-2 border border-white/5'>
                                <div className='flex items-center justify-between'>
                                  <div className='flex items-center gap-2 w-28'><Shield color1={home?.color1} color2={home?.color2} initial={home?.name} size='xs' isFlag={home?.isFlag} /><span className='text-[9px] font-bold uppercase truncate italic'>{home?.name || 'TBD'}</span></div>
                                  <div className='flex flex-col items-center flex-1'>
                                    {isPlayedIda ? <div className='flex items-center gap-2 bg-slate-800/60 px-1.5 rounded'><span className='text-[10px] font-black tabular-nums'>{m.sh} - {m.sa}</span><span className='text-[7px] font-bold text-slate-400 uppercase italic'>Ida</span></div> : <span className='text-[8px] font-black text-slate-500 italic'>VS (Ida)</span>}
                                  </div>
                                  <div className='flex items-center gap-2 w-28 justify-end'><span className='text-[9px] font-bold uppercase truncate italic text-right'>{away?.name || 'TBD'}</span><Shield color1={away?.color1} color2={away?.color2} initial={away?.name} size='xs' isFlag={away?.isFlag} /></div>
                                </div>

                                {isChampions && phase !== 'Final' && (
                                  <div className='flex items-center justify-between border-t border-white/10 pt-2'>
                                    <div className='flex items-center gap-2 w-28'><Shield color1={away?.color1} color2={away?.color2} initial={away?.name} size='xs' isFlag={away?.isFlag} /><span className='text-[9px] font-bold uppercase truncate italic'>{away?.name || 'TBD'}</span></div>
                                    <div className='flex flex-col items-center flex-1'>
                                      {isPlayedVuelta ? (
                                        <div className='flex flex-col items-center'>
                                          <div className='flex items-center gap-2 bg-slate-800/60 px-1.5 rounded'><span className='text-[10px] font-black tabular-nums'>{m.sh2} - {m.sa2}</span><span className='text-[7px] font-bold text-slate-400 uppercase italic'>Vuelta</span></div>
                                          <div className='flex items-center gap-1 mt-1'>
                                            <span className='text-[8px] font-black text-blue-300 uppercase italic bg-blue-900/40 px-1.5 rounded'>Global: {m.sh + m.sh2} - {m.sa + m.sa2}</span>
                                            {m.penH !== undefined && m.penH !== null && <span className='text-[7px] text-blue-200 font-bold'>(pen {m.penH}-{m.penA})</span>}
                                          </div>
                                        </div>
                                      ) : <span className='text-[7px] font-bold text-slate-500 uppercase italic'>Vuelta Pendiente</span>}
                                    </div>
                                    <div className='flex items-center gap-2 w-28 justify-end'><span className='text-[9px] font-bold uppercase truncate italic text-right'>{home?.name || 'TBD'}</span><Shield color1={home?.color1} color2={home?.color2} initial={home?.name} size='xs' isFlag={home?.isFlag} /></div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );

    if (compView === 'bracket') return (
      <div className='flex-grow px-4 pb-20'>
        <div className='flex items-center gap-3 mb-6'>
          <button onClick={() => setCompView('main')} className='p-2 bg-slate-900/30 backdrop-blur-md rounded-xl active:scale-95 transition-all border border-white/10'><ChevronLeft /></button>
          <h2 className='text-xl font-black italic uppercase drop-shadow-md'>Eliminatorias</h2>
        </div>
        {!activeComp.bracket ? (
          <div className='text-center py-20 text-slate-300 font-black bg-slate-900/30 backdrop-blur-md rounded-[2rem] border border-white/10 uppercase italic text-[10px] shadow-lg'>Las eliminatorias se generarán al finalizar la fase de grupos.</div>
        ) : (
          <div className='flex gap-8 overflow-x-auto custom-scrollbar pb-8'>
            {['Octavos', 'Cuartos', 'Semis', 'Final'].filter(p => activeComp.bracket[p]).map(phase => (
              <div key={phase} className='min-w-[280px] flex-shrink-0'>
                <h3 className='text-[10px] font-black uppercase text-blue-300 mb-4 px-3 border-l-2 border-blue-500 bg-slate-900/40 backdrop-blur-md rounded-r-xl py-1 drop-shadow-md'>{phase}</h3>
                <div className='grid grid-cols-1 gap-3'>
                  {(Array.isArray(activeComp.bracket[phase]) ? activeComp.bracket[phase] : [activeComp.bracket[phase]]).filter(m => m !== null).map((m, mi) => {
                    const h = activeComp.teams.find(t => t.id === m.hId); const a = activeComp.teams.find(t => t.id === m.aId);
                    const isChampions = activeCompId === 'C1';
                    let winner = null;
                    if ((isChampions && phase !== 'Final' ? m.sh2 !== null : m.sh !== null)) {
                      if (isChampions && phase !== 'Final') {
                        const totH = (m.sh || 0) + (m.sh2 || 0); const totA = (m.sa || 0) + (m.sa2 || 0);
                        if (totH > totA) winner = h; else if (totA > totH) winner = a; else if (m.penH !== null && m.penH !== undefined) winner = m.penH > m.penA ? h : a;
                      } else {
                        if (m.sh > m.sa) winner = h; else if (m.sa > m.sh) winner = a; else if (m.penH !== null && m.penH !== undefined) winner = m.penH > m.penA ? h : a;
                      }
                    }

                    return (
                      <div key={mi} className='bg-slate-900/30 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex flex-col gap-2 shadow-lg'>
                        <div className='flex justify-between items-center'>
                          <div className='flex items-center gap-2 flex-1'><Shield color1={h?.color1} color2={h?.color2} initial={h?.name} size='xs' isFlag={h?.isFlag} /><span className={'text-[10px] font-bold uppercase italic truncate ' + (h ? 'text-white' : 'text-slate-400')}>{h?.name || 'TBD'}</span></div>
                          <div className='flex items-center gap-2 tabular-nums font-black italic text-xs bg-black/30 px-2 py-0.5 rounded'>
                            {m.sh !== null && <span>{m.sh}</span>}{isChampions && m.sh2 !== null && <span className='text-slate-400 text-[10px]'>({m.sh2})</span>}{m.penH !== null && m.penH !== undefined && <span className='text-red-400 text-[9px] font-black'>[{m.penH}]</span>}
                          </div>
                        </div>
                        <div className='flex justify-between items-center'>
                          <div className='flex items-center gap-2 flex-1'><Shield color1={a?.color1} color2={a?.color2} initial={a?.name} size='xs' isFlag={a?.isFlag} /><span className={'text-[10px] font-bold uppercase italic truncate ' + (a ? 'text-white' : 'text-slate-400')}>{a?.name || 'TBD'}</span></div>
                          <div className='flex items-center gap-2 tabular-nums font-black italic text-xs bg-black/30 px-2 py-0.5 rounded'>
                            {m.sa !== null && <span>{m.sa}</span>}{isChampions && m.sa2 !== null && <span className='text-slate-400 text-[10px]'>({m.sa2})</span>}{m.penA !== null && m.penA !== undefined && <span className='text-red-400 text-[9px] font-black'>[{m.penA}]</span>}
                          </div>
                        </div>
                        {winner && (
                          <div className='mt-2 pt-2 border-t border-white/10 flex items-center justify-center gap-2 bg-emerald-900/30 backdrop-blur-sm rounded-b-xl'>
                            <span className='text-[7px] font-black uppercase text-emerald-300 italic'>Pasa:</span>
                            <Shield color1={winner.color1} color2={winner.color2} initial={winner.name} size='xs' isFlag={winner.isFlag} />
                            <span className='text-[8px] font-black uppercase italic text-white truncate max-w-[100px]'>{winner.name}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );

    if (compView === 'playing') {
      if (!matchState) return null;
      return (
        <div className='flex-grow flex flex-col px-4'>
        <div className='flex justify-between items-center mb-4'>
          <button onClick={() => setCompView('main')} className='p-2 bg-slate-900/30 backdrop-blur-md border border-white/10 rounded-xl text-slate-200 active:scale-95 transition-all'><ChevronLeft /></button>
          <div className='flex flex-col items-center gap-1'>
            <div className='px-4 py-1 bg-red-600/80 backdrop-blur-md rounded-full text-[9px] font-black uppercase italic animate-pulse shadow-md'>En Vivo</div>
            <span className='text-[8px] font-black uppercase italic text-slate-300 tracking-wider'>
              {activeComp.phase === 'Final' ? '🏆 Gran Final' : isLeague || activeComp.phase === 'groups' ? `📅 Jornada ${currentMatchday + 1}` : `⚔️ ${activeComp.phase}${activeCompId === 'C1' ? (activeComp.matchday % 2 === 0 ? ' — Ida' : ' — Vuelta') : ''}`}
            </span>
          </div>
          <div className='w-10'></div>
        </div>

        <div className='bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] p-6 mb-4 border-b-4 border-slate-800 relative shadow-xl'>
          {matchState.aggregate && (
            <div className='absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600/90 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-400 shadow-lg z-10'>
              <span className='text-[8px] font-black uppercase italic text-white tracking-widest'>Global: {matchState.aggregate.sh + matchState.scoreH} - {matchState.aggregate.sa + matchState.scoreA}</span>
            </div>
          )}
          <div className='flex items-center'>
            <div className='flex-1 flex flex-col items-center text-center'>
              {matchState.phase === 'penalties' && <PenaltyDots history={matchState.penalties?.historyH} />}
              <Shield color1={matchState.home?.color1} color2={matchState.home?.color2} initial={matchState.home?.name} size='lg' isFlag={matchState.home?.isFlag} />
              <p className='text-[10px] font-black uppercase italic mt-2 truncate text-white drop-shadow-md w-full'>{matchState.home?.name}</p>
              <p className='text-[8px] font-bold text-slate-300 mt-1 bg-black/40 backdrop-blur-sm inline-block px-2 rounded'>{matchState.home.att + '/' + matchState.home.opp + '/' + matchState.home.def}</p>
            </div>

            <div className='px-4 flex flex-col items-center shrink-0 w-32'>
              <div className='text-5xl font-black italic tracking-tighter flex gap-3 tabular-nums drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] text-white'><span>{matchState.scoreH}</span><span className='text-slate-400'>-</span><span>{matchState.scoreA}</span></div>
              {!matchState.finished && matchState.phase !== 'penalties' && <div className='text-[8px] font-black text-white/70 uppercase italic mt-1 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm'>{matchState.oppH} vs {matchState.oppA} TIROS RESTANTES</div>}
              {matchState.phase === 'penalties' && (
                <div className='mt-2 flex flex-col items-center w-full'>
                  <span className='text-[8px] font-black text-red-400 uppercase italic'>Penaltis</span>
                  <div className='text-xl font-black italic text-blue-300 tabular-nums drop-shadow-md'>(pen {matchState.penalties.scoreH} - {matchState.penalties.scoreA})</div>
                  {matchState.penalties.shotsH < 5 || matchState.penalties.shotsA < 5 ? (
                    <div className='flex justify-between w-full text-[7px] font-bold text-slate-300 uppercase mt-1'><span>Res H: {5 - matchState.penalties.shotsH}</span><span>Res A: {5 - matchState.penalties.shotsA}</span></div>
                  ) : <div className='text-[7px] font-bold text-yellow-400 uppercase mt-1 animate-pulse'>¡Muerte Súbita!</div>}
                  <div className='text-[7px] font-bold text-slate-200 uppercase mt-1 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded text-center'>{matchState.penalties.phase === 'att' ? '⚽ Preparando Disparo' : '🧤 ¡El portero se prepara!'}</div>
                </div>
              )}
            </div>

            <div className='flex-1 flex flex-col items-center text-center'>
              {matchState.phase === 'penalties' && <PenaltyDots history={matchState.penalties?.historyA} />}
              <Shield color1={matchState.away?.color1} color2={matchState.away?.color2} initial={matchState.away?.name} size='lg' isFlag={matchState.away?.isFlag} />
              <p className='text-[10px] font-black uppercase italic mt-2 truncate text-white drop-shadow-md w-full'>{matchState.away?.name}</p>
              <p className='text-[8px] font-bold text-slate-300 mt-1 bg-black/40 backdrop-blur-sm inline-block px-2 rounded'>{matchState.away.att + '/' + matchState.away.opp + '/' + matchState.away.def}</p>
            </div>
          </div>
        </div>

        <div className='flex-grow bg-[#2e7d32]/60 backdrop-blur-md rounded-[3rem] border-8 border-slate-900/40 relative overflow-hidden flex flex-col items-center justify-center shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]'>
          <div className='absolute top-1/2 left-0 w-full h-[2px] bg-white/20 -translate-y-1/2'></div>
          <div className='absolute top-1/2 left-1/2 w-40 h-40 border-[2px] border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2'></div>
          <div className='absolute top-1/2 left-1/2 w-3 h-3 bg-white/20 rounded-full -translate-x-1/2 -translate-y-1/2'></div>

          {!matchState.finished ? (
            <div className='z-10 flex flex-col items-center gap-8'>
              <div className={'transition-all duration-300 transform ' + (rolling ? 'scale-125 rotate-45' : 'scale-100')}>
                <DieIcon value={matchState.lastDie} className='w-24 h-24 text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.8)]' />
              </div>
              <button onClick={handleRoll} disabled={rolling} className='bg-white/90 backdrop-blur-sm text-emerald-900 px-10 py-5 rounded-3xl font-black uppercase italic tracking-widest shadow-[0_10px_20px_rgba(0,0,0,0.5)] active:scale-90 transition-transform disabled:opacity-50'>{rolling ? 'Lanzando...' : 'Lanzar Dado'}</button>
            </div>
          ) : (
            <div className='z-10 text-center p-6 bg-black/40 backdrop-blur-md rounded-3xl border border-white/20 max-w-[80%] shadow-2xl'>
              <Trophy size={48} className='text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' />
              <h3 className='text-lg font-black uppercase italic mb-4 text-white drop-shadow-md'>¡Fin del Partido!</h3>
              <button onClick={processMatchday} className='w-full bg-white/90 backdrop-blur-sm text-slate-950 py-4 rounded-2xl font-black uppercase italic tracking-widest active:scale-95 transition-all shadow-md'>Finalizar</button>
            </div>
          )}
        </div>

        <div className='mt-4 bg-slate-900/40 backdrop-blur-md rounded-3xl p-5 h-40 overflow-y-auto border border-white/10 space-y-2 shadow-lg custom-scrollbar'>
          {matchState.logs.map((log, i) => (
            <div key={i} className={'text-[10px] font-bold italic flex gap-3 ' + (i === 0 ? 'text-white drop-shadow-md' : 'text-slate-300')}><span className='opacity-60 shrink-0'>⚽</span><p>{log}</p></div>
          ))}
        </div>
      </div>
    );
    }

    if (compView === 'teamSelect') return (
      <div className='flex-grow px-4 pb-20'>
        <div className='flex items-center gap-3 mb-6'>
          <button onClick={() => setCompView('main')} className='p-2 bg-slate-900/30 backdrop-blur-md rounded-xl active:scale-95 transition-all border border-white/10'><ChevronLeft /></button>
          <h2 className='text-xl font-black italic uppercase drop-shadow-md'>Seleccionar Equipo {isDiv2 ? '(2ª Div)' : ''}</h2>
        </div>
        {isLeague && (
          <div className='flex mb-4 bg-slate-900/40 p-1 rounded-2xl border border-white/10 backdrop-blur-md'>
            <button onClick={() => setViewDiv(1)} className={`flex-1 py-2 text-[10px] font-black uppercase italic rounded-[10px] transition-all ${!isDiv2 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>1ª División</button>
            <button onClick={() => setViewDiv(2)} className={`flex-1 py-2 text-[10px] font-black uppercase italic rounded-[10px] transition-all ${isDiv2 ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>2ª División</button>
          </div>
        )}
        <div className='grid gap-3 overflow-y-auto max-h-[75vh] pr-2 custom-scrollbar'>
          {Array.isArray(currentTeams) && currentTeams.map(t => (
            <button key={t.id} onClick={() => { updateActiveComp(isDiv2 ? { userTeamId2: t.id } : { userTeamId: t.id }); setCompView('main'); }} className={'flex items-center gap-4 p-4 rounded-3xl border transition-all active:scale-95 backdrop-blur-md ' + (t.id === currentUserTeamId ? 'bg-blue-600/60 border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.5)]' : 'bg-slate-900/40 border-white/10 hover:border-white/30')}>
              <Shield color1={t?.color1} color2={t?.color2} initial={t?.name} size='md' isFlag={t?.isFlag} />
              <div className='text-left'>
                <p className='text-xs font-black uppercase italic text-white drop-shadow-md'>{t?.name}</p>
                <p className='text-[8px] font-bold text-slate-200 uppercase bg-black/40 px-1.5 py-0.5 rounded inline-block mt-1'>{t?.att + '/' + t?.opp + '/' + t?.def}</p>
              </div>
              {t.id === currentUserTeamId && <div className='ml-auto bg-white/30 p-1.5 rounded-full shadow-inner'><Check size={14} className="text-white"/></div>}
            </button>
          ))}
        </div>
      </div>
    );

    return null;
  };

  return (
    <div className='relative min-h-screen selection:bg-blue-500/30 font-sans text-slate-100 overflow-hidden'>
      <div className='fixed inset-0 bg-[url("https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2000&auto=format&fit=crop")] bg-cover bg-center bg-no-repeat z-0'></div>
      <div className='fixed inset-0 bg-slate-950/60 z-0 backdrop-blur-[2px]'></div>

      <div className='relative z-10 max-w-md mx-auto min-h-screen flex flex-col'>
        <AnimatePresence mode='wait'>
          {view === 'hub' && <motion.div key='hub' className='flex-grow flex flex-col' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><HubView career={career} onOpenCareer={openCareer} setView={setView} setActiveCompId={setActiveCompId} setCompView={setCompView} comps={comps} seasonState={seasonState} pendingLeagueIds={pendingLeagueIds} allLeaguesFinished={allLeaguesFinished} championsFinished={championsFinished} onSimulateLeague={simulateLeagueToGlobal} onSimulateAll={simulateAllPendingLeagues} onNewSeason={startNewGlobalSeason} /></motion.div>}
          {view === 'rules' && <motion.div key='rules' className='flex-grow flex flex-col' initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }}><RulesView setView={setView} /></motion.div>}
          {view === 'archive' && <motion.div key='archive' className='flex-grow flex flex-col' initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}><ArchiveView selectedArchiveEntry={selectedArchiveEntry} setSelectedArchiveEntry={setSelectedArchiveEntry} setView={setView} archive={archive} /></motion.div>}
          {view === 'competition' && <motion.div key='comp' className='flex-grow flex flex-col' initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.1, opacity: 0 }}><CompetitionView /></motion.div>}
          {view === 'careerSelect' && (
            <motion.div key='careerSelect' className='flex-grow flex flex-col' initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <CareerSelectView
                candidates={careerCandidates}
                leagueName={comps[CAREER_LEAGUE_ID]?.name || 'Miscelánea'}
                onBack={() => setView('hub')}
                onStart={startCareer}
                ui={careerUi}
              />
            </motion.div>
          )}
          {view === 'career' && careerTeam && (
            <motion.div key='career' className='flex-grow flex flex-col' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CareerView
                career={career}
                team={careerTeam}
                comp={careerComp}
                standings={careerStandings}
                position={careerPosition}
                seasonState={seasonState}
                nextFixture={careerFixture}
                rival={careerRival}
                isHome={careerIsHome}
                divisionFinished={careerDivisionFinished}
                worldPending={careerWorldPending}
                onBack={() => setView('hub')}
                onPlayMatch={startCareerMatch}
                onSimulateMatch={simulateCareerMatchday}
                onSimulateWorld={() => syncLeaguesToGlobal(LEAGUE_IDS.filter(id => id !== career.compId))}
                onSetTactic={setCareerTactic}
                onSpendPE={spendCareerPE}
                onApplyTrainingStats={applyTrainingStats}
                onApplyDrillResult={applyDrillResult}
                onOpenReview={openCareerReview}
                onRenameManager={renameCareerManager}
                reviewDone={
                  career.signedForSeason === (seasonState.season || 1) ||
                  career.lastProcessedSeason === (seasonState.season || 1)
                }
                contractSigned={career.signedForSeason === (seasonState.season || 1)}
                allLeaguesFinished={allLeaguesFinished}
                championsFinished={championsFinished}
                onNewSeason={() => { startNewGlobalSeason(); setView('career'); }}
                clInfo={careerClInfo}
                clComp={comps['C1']}
                onPlayChampionsMatch={startCareerChampionsMatch}
                onSimulateChampionsMatch={simulateCareerChampionsMatch}
                onSimulateAllChampions={simulateAllCareerChampions}
                schedule={careerSchedule}
                onOpenChampions={openCareerChampions}
                onAcceptOffer={acceptCareerOffer}
                onRejectOffer={(offerId) => setCareer(c => ({ ...c, offers: (c.offers || []).filter(o => o.id !== offerId) }))}
                onSubmitApplication={submitCareerApplication}
                onAdvanceOfficeWeek={advanceCareerOfficeWeek}
                onDismissAppResolutionModal={() => setCareer(c => ({ ...c, pendingAppResolutionModal: null }))}
                onDismissSimulationFeedback={() => setCareer(c => ({ ...c, lastSimulationFeedback: null }))}
                allComps={comps}
                ui={careerUi}
              />
            </motion.div>
          )}
          {view === 'careerMatch' && (
            <motion.div key='careerMatch' className='flex-grow flex flex-col' initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
              <CareerMatchView matchState={matchState} rolling={rolling} onRoll={handleRoll} onFinish={finishCareerMatchday} ui={careerUi} />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {careerReview && (
            <CareerSeasonReviewModal review={careerReview} onAcceptOffer={acceptCareerOffer} onRenew={renewCareerContract} onStay={closeCareerReview} ui={careerUi} />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {simulationInjuryAlert && (
            <SimulationInjuryAlertModal
              isOpen={!!simulationInjuryAlert}
              affectedAttr={simulationInjuryAlert.affectedAttr}
              attrLabel={simulationInjuryAlert.attrLabel}
              die={simulationInjuryAlert.die}
              physioCost={simulationInjuryAlert.physioCost}
              categoryLabel={simulationInjuryAlert.categoryLabel}
              career={career}
              team={careerTeam}
              onSelectOption={handleSimulationInjuryChoice}
              onCancel={() => setSimulationInjuryAlert(null)}
              ui={careerUi}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default DiceFootballApp;
