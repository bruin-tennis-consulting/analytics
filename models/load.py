import pandas as pd

# Read CSV file
csv_path = '../data/pbp_matches_wta_qual_current.csv'
df_matches = pd.read_csv(csv_path, nrows=1000)

print(f"Loaded {len(df_matches)} matches from CSV")
print(f"Columns: {df_matches.columns.tolist()}")

# --- constants ---
POINT_MAP = {0: 0, 15: 1, 30: 2, 40: 3}
games_sep = ';'
sets_sep = '.'

def expand_pbp(row):
    p1_sets = 0
    p2_sets = 0
    sets = []
    for set_str in row['pbp'].split(sets_sep):
        games = [g for g in set_str.split(games_sep) if g]
        sets.append(games)

    # Features per point
    records = []
    server_is_p1 = True  # assume player1 starts serving; can alternate per set if known
    for set_idx, games in enumerate(sets, start=1):
        p1_games = p2_games = 0
        for game_idx, game in enumerate(games, start=1):
            p1_pts = p2_pts = 0
            for pt_char in game:
                # Determine winner
                if pt_char in ['S', 'A']:  # server wins
                    server_point_won = 1
                elif pt_char in ['R']:  # returner wins
                    server_point_won = 0
                elif pt_char in ['D']:  # double fault -> returner wins
                    server_point_won = 0
                else:
                    continue

                # Update scores
                if server_point_won:
                    if server_is_p1:
                        p1_pts += 1
                    else:
                        p2_pts += 1
                else:
                    if server_is_p1:
                        p2_pts += 1
                    else:
                        p1_pts += 1

                # Break point if server losing and returner has 40 or advantage
                is_break_point = (p2_pts >= 3 and p2_pts - p1_pts >= 0) if server_is_p1 else (p1_pts >= 3 and p1_pts - p2_pts >= 0)

                records.append({
                    'player1SetScore': p1_sets,
                    'player2SetScore': p2_sets,
                    'player1GameScore': p1_games,
                    'player2GameScore': p2_games,
                    'player1PointScore': p1_pts if server_is_p1 else p2_pts,
                    'player2PointScore': p2_pts if server_is_p1 else p1_pts,
                    'is_break_point': int(is_break_point),
                    'server_is_player1': int(server_is_p1),
                    'point_won': server_point_won
                })

            # Game winner
            if p1_pts > p2_pts:
                p1_games += 1
            else:
                p2_games += 1
            server_is_p1 = not server_is_p1  # alternate server

        # Set winner
        if p1_games > p2_games:
            p1_sets += 1
        else:
            p2_sets += 1

    return pd.DataFrame(records)

# --- run ---
all_points = []
for idx, row in df_matches.iterrows():
    # Convert CSV row to expected format
    match_row = {
        'match_id': row['pbp_id'],
        'date': row['date'],
        'tournament': row['tny_name'],
        'tour': row['tour'],
        'round': row['draw'],
        'player1Name': row['server1'],
        'player2Name': row['server2'],
        'player1SetsWon': row['winner'],
        'pbp': row['pbp'],
        'score': row['score'],
        'best_of': 3,
        'extra': str(row['wh_minutes']) + ';' if pd.notna(row['wh_minutes']) else ''
    }
    
    try:
        df_points = expand_pbp(match_row)
        df_points['match_id'] = match_row['match_id']
        all_points.append(df_points)
        if (idx + 1) % 100 == 0:
            print(f"Processed {idx + 1} matches...")
    except Exception as e:
        print(f"Error processing match {match_row['match_id']}: {e}")
        continue

# Combine all points
if all_points:
    final_df = pd.concat(all_points, ignore_index=True)
    print(f"\nTotal points processed: {len(final_df)}")
    print("\nFirst few rows:")
    print(final_df.head(10))
    print("\nDataFrame info:")
    print(final_df.info())
    print("\nSummary statistics:")
    print(final_df.describe())
    
    # Export to CSV
    output_path = '../data/expanded_points.csv'
    final_df.to_csv(output_path, index=False)
    print(f"\n✓ Data exported to: {output_path}")
    
    # Optionally export to other formats:
    # final_df.to_excel('data/expanded_points.xlsx', index=False)  # Excel
    # final_df.to_json('data/expanded_points.json', orient='records')  # JSON
    # final_df.to_parquet('data/expanded_points.parquet', index=False)  # Parquet
else:
    print("No points processed successfully.")
